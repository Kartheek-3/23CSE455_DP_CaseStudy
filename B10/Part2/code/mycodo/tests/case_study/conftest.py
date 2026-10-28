# coding=utf-8
"""Shared fixtures for the case-study tests (Part 2).

These tests run without a Mycodo installation (no daemon, no SQLite settings
database, no InfluxDB). Database look-ups and daemon calls are replaced with
unittest.mock objects.

The POSIX-only standard-library modules ``grp`` and ``pwd`` are imported at
module level by ``mycodo.utils.system_pi`` / ``mycodo.utils.widget_generate_html``
(reached through ``mycodo.mycodo_client``). They do not exist on Windows, so an
empty stand-in module is registered for them when they are missing. Nothing in
the code under test calls into them.
"""
import importlib
import json
import sys
import types
from unittest import mock

import pytest

for _name in ('grp', 'pwd'):
    try:
        importlib.import_module(_name)
    except ImportError:
        sys.modules[_name] = types.ModuleType(_name)

from mycodo.tests.case_study.helpers import BANG_BANG_OPTIONS  # noqa: E402


@pytest.fixture
def make_bang_bang():
    """Build a real bang_bang.CustomModule with the database and daemon mocked.

    Keyword arguments override the stored custom options; ``output_channel``
    is the channel number returned for the selected output channel (None means
    the output channel cannot be found).
    """
    from mycodo.functions import bang_bang

    def factory(output_channel=0, **option_overrides):
        options = dict(BANG_BANG_OPTIONS, **option_overrides)
        function_row = mock.Mock(
            unique_id='func-0001',
            log_level_debug=False,
            custom_options=json.dumps(options))

        base_db = mock.MagicMock()
        base_db.return_value.filter.return_value.all.return_value = []
        base_db.return_value.filter.return_value.first.return_value = (
            None if output_channel is None else mock.Mock(channel=output_channel))

        with mock.patch.object(bang_bang, 'db_retrieve_table_daemon', return_value=function_row), \
                mock.patch('mycodo.abstract_base_controller.db_retrieve_table_daemon', base_db), \
                mock.patch.object(bang_bang, 'DaemonControl'):
            module = bang_bang.CustomModule(function_row)

        module.get_last_measurement = mock.Mock()
        module.logger = mock.Mock()
        return module

    return factory
