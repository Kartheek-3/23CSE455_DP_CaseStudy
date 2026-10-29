<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component
	:is="self ? 'MkA' : 'a'" ref="el" :class="$style.root" class="_link" :[attr]="maybeRelativeUrl" :rel="rel ?? 'nofollow noopener'" :target="target"
	:behavior="props.navigationBehavior"
	@click="onClick"
	@contextmenu.stop="() => {}"
>
	<template v-if="!self">
		<span :class="$style.schema">{{ schema }}//</span>
		<span :class="$style.hostname">{{ hostname }}</span>
		<span v-if="port != ''">:{{ port }}</span>
	</template>
	<template v-if="pathname === '/' && self">
		<span :class="$style.self">{{ hostname }}</span>
	</template>
	<span v-if="pathname != ''" :class="$style.pathname">{{ self ? pathname.substring(1) : pathname }}</span>
	<span :class="$style.query">{{ query }}</span>
	<span :class="$style.hash">{{ hash }}</span>
	<i v-if="isSuspicious" :class="[$style.icon, $style.warnIcon]" class="ti ti-alert-triangle" v-tooltip="suspicionReason"></i>
	<i v-if="target === '_blank'" :class="$style.icon" class="ti ti-external-link"></i>
</component>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import { url as local } from '@@/js/config.js';
import { maybeMakeRelative, parseUrlForDisplay } from '@@/js/url.js';
import type { MkABehavior } from '@/components/global/MkA.vue';
import * as os from '@/os.js';
import { useTooltip } from '@/composables/use-tooltip.js';
import { isEnabledUrlPreview } from '@/utility/url-preview.js';

const props = withDefaults(defineProps<{
	url: string;
	rel?: string;
	showUrlPreview?: boolean;
	navigationBehavior?: MkABehavior;
}>(), {
	showUrlPreview: true,
});

const maybeRelativeUrl = maybeMakeRelative(props.url, local);
const self = maybeRelativeUrl !== props.url;
const { schema, hostname, port, pathname, query, hash } = parseUrlForDisplay(props.url);
const el = ref();

const isSuspicious = computed(() => {
	if (self) return false;
	try {
		const u = new URL(props.url);
		if (u.username || u.password) return true;
		if (u.hostname.startsWith('xn--') || u.hostname.includes('.xn--')) return true;
		if (/^(\d{1,3}\.){3}\d{1,3}$/.test(u.hostname)) return true;
	} catch {
		return true;
	}
	return false;
});

const suspicionReason = computed(() => {
	if (!isSuspicious.value) return '';
	try {
		const u = new URL(props.url);
		if (u.username || u.password) return 'Suspicious URL: contains embedded credentials';
		if (u.hostname.startsWith('xn--') || u.hostname.includes('.xn--')) return 'Advisory: Internationalized/Punycode domain';
		if (/^(\d{1,3}\.){3}\d{1,3}$/.test(u.hostname)) return 'Advisory: Numeric IP destination';
	} catch {
		return 'Malformed destination URL';
	}
	return 'Potential link safety advisory';
});

async function onClick(ev: MouseEvent) {
	if (isSuspicious.value) {
		ev.preventDefault();
		const { canceled } = await os.confirm({
			type: 'warning',
			title: 'External Link Security Warning',
			text: `Destination: ${hostname}\nRisk Advisory: ${suspicionReason.value}\nAre you sure you want to proceed to this external website?`,
			okText: 'Proceed to website',
			cancelText: 'Cancel',
		});
		if (!canceled) {
			window.open(props.url, '_blank', 'noopener,noreferrer');
		}
	}
}

if (props.showUrlPreview && isEnabledUrlPreview.value) {
	useTooltip(el, (showing) => {
		const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
			showing,
			url: props.url,
			anchorElement: el.value instanceof HTMLElement ? el.value : el.value?.$el,
		}, {
			closed: () => dispose(),
		});
	});
}

const attr = self ? 'to' : 'href';
const target = self ? null : '_blank';
</script>

<style lang="scss" module>
.warnIcon {
	color: var(--warn, #f59e0b);
	margin-left: 2px;
	font-size: 0.95em;
}
.root {
	word-break: break-all;
}

.icon {
	padding-left: 2px;
	font-size: .9em;
}

.self {
	font-weight: bold;
}

.schema {
	color: color(from currentcolor srgb r g b / 0.5); // DOMノード全体をopacityで半透明化するより文字色を半透明化した方が若干レンダリングパフォーマンスが良い
}

.hostname {
	font-weight: bold;
}

.pathname {
	color: color(from currentcolor srgb r g b / 0.8); // DOMノード全体をopacityで半透明化するより文字色を半透明化した方が若干レンダリングパフォーマンスが良い
}

.query {
	color: color(from currentcolor srgb r g b / 0.5); // DOMノード全体をopacityで半透明化するより文字色を半透明化した方が若干レンダリングパフォーマンスが良い
}

.hash {
	font-style: italic;
}
</style>
