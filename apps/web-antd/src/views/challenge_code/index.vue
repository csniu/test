<script lang="ts" setup>
import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Input,
  message,
  Space,
  Typography,
} from 'ant-design-vue';

import { generateChallengeOtpApi } from '#/api/core/challenge';
import { $t } from '#/locales';

const SpaceCompact = Space.Compact;

const CHALLENGE_LENGTH = 16;

const inputText = ref('');
const otpResult = ref('');
const loading = ref(false);
const copied = ref(false);

const isInputValid = computed(
  () => inputText.value.length === CHALLENGE_LENGTH,
);

function handleChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
    .replaceAll(/\s+/gu, '')
    .slice(0, CHALLENGE_LENGTH);
  inputText.value = value;
  otpResult.value = '';
  copied.value = false;
}

async function handleGenerate() {
  if (!isInputValid.value) return;
  loading.value = true;
  otpResult.value = '';
  copied.value = false;
  try {
    const res = await generateChallengeOtpApi(inputText.value);
    otpResult.value = res.otp;
  } catch {
    message.error($t('page.challenge-code.requestFail'));
  } finally {
    loading.value = false;
  }
}

async function handleCopy() {
  if (!otpResult.value) return;
  try {
    await navigator.clipboard.writeText(otpResult.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    message.error($t('page.challenge-code.copyFail'));
  }
}
</script>

<template>
  <Page auto-content-height content-class="flex flex-col">
    <Card
      class="flex flex-1 flex-col"
      :body-style="{ flex: 1, display: 'flex', flexDirection: 'column' }"
    >
      <div class="flex flex-1 flex-col items-center justify-center pb-24">
        <!-- search bar -->
        <SpaceCompact class="w-full max-w-2xl">
          <Input
            :value="inputText"
            :maxlength="CHALLENGE_LENGTH"
            size="large"
            allow-clear
            :placeholder="$t('page.challenge-code.inputPlaceholder')"
            class="font-mono"
            @change="handleChange"
            @press-enter="handleGenerate"
          >
            <template #suffix>
              <Typography.Text
                :type="isInputValid ? undefined : 'secondary'"
                class="tabular-nums"
              >
                {{ inputText.length }}/{{ CHALLENGE_LENGTH }}
              </Typography.Text>
            </template>
          </Input>
          <Button
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!isInputValid"
            @click="handleGenerate"
          >
            {{ $t('page.challenge-code.generate') }}
          </Button>
        </SpaceCompact>

        <!-- result -->
        <transition name="slide-fade">
          <Card v-if="otpResult" class="mt-6 w-full max-w-2xl">
            <template #title>
              <Typography.Text
                type="secondary"
                class="text-xs uppercase tracking-wider"
              >
                {{ $t('page.challenge-code.otpTitle') }}
              </Typography.Text>
            </template>
            <template #extra>
              <Button size="small" @click="handleCopy">
                {{
                  copied
                    ? $t('page.challenge-code.copied')
                    : $t('page.challenge-code.copy')
                }}
              </Button>
            </template>
            <Typography.Text code class="!text-xl !font-bold !tracking-widest">
              {{ otpResult }}
            </Typography.Text>
          </Card>
        </transition>
      </div>
    </Card>
  </Page>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
