# coding=utf-8
"""Crop profiles: target soil moisture and tolerance per crop type.

A crop profile supplies the setpoint (target soil moisture) and the hysteresis
(tolerance) for irrigation control, so a user can select a crop instead of
entering raw numbers. Soil moisture is expressed in percent (0-100); the
measurement used with a profile must be in percent (rescale raw sensor values
with the Input's measurement rescaling if needed).

New crop types are added in one place: register them below with
register_crop_profile(). This module is plain Python (no Flask/database
imports) so it can be used by any Function module and tested in isolation.

The values below are illustrative defaults for the case study, not agronomic advice.
"""
from dataclasses import dataclass

# Selection value meaning "no crop profile: use the Setpoint and Hysteresis options"
CUSTOM_CROP_PROFILE = 'custom'


class UnknownCropProfileError(LookupError):
    """Raised when a crop profile id is not registered."""


@dataclass(frozen=True)
class CropProfile:
    name_unique: str
    name: str
    target_moisture: float  # setpoint, percent soil moisture
    tolerance: float  # hysteresis, percent soil moisture above/below the target

    def __post_init__(self):
        if not self.name_unique:
            raise ValueError("Crop profile id must not be empty")
        if self.name_unique == CUSTOM_CROP_PROFILE:
            raise ValueError(f"Crop profile id '{CUSTOM_CROP_PROFILE}' is reserved")
        if self.tolerance <= 0:
            raise ValueError(f"Crop '{self.name_unique}': tolerance must be greater than 0")
        if not 0 <= self.target_moisture <= 100:
            raise ValueError(f"Crop '{self.name_unique}': target moisture must be between 0 and 100 %")
        if self.target_moisture - self.tolerance < 0 or self.target_moisture + self.tolerance > 100:
            raise ValueError(f"Crop '{self.name_unique}': target +/- tolerance must stay between 0 and 100 %")


_crop_profiles = {}


def register_crop_profile(profile):
    """Add a crop type. Raises ValueError if its id is already registered."""
    if profile.name_unique in _crop_profiles:
        raise ValueError(f"Crop profile '{profile.name_unique}' is already registered")
    _crop_profiles[profile.name_unique] = profile
    return profile


def unregister_crop_profile(name_unique):
    """Remove a crop type (used by tests and plugins that add temporary crops)."""
    _crop_profiles.pop(name_unique, None)


def get_crop_profile(name_unique):
    """Single lookup point for crop profiles."""
    try:
        return _crop_profiles[name_unique]
    except KeyError:
        raise UnknownCropProfileError(f"Unknown crop profile '{name_unique}'") from None


def crop_profile_choices():
    """(id, display name) pairs of all registered crops, sorted by display name."""
    return [(profile.name_unique, profile.name)
            for profile in sorted(_crop_profiles.values(), key=lambda p: p.name)]


register_crop_profile(CropProfile('tomato', 'Tomato', target_moisture=65.0, tolerance=5.0))
register_crop_profile(CropProfile('rice', 'Rice', target_moisture=85.0, tolerance=5.0))
register_crop_profile(CropProfile('wheat', 'Wheat', target_moisture=50.0, tolerance=5.0))
