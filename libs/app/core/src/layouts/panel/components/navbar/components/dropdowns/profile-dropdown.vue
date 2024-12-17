<template>
  <div class="profile-dropdown-wrapper">
    <VaDropdown v-model="isShown" :offset="[9, 0]" class="profile-dropdown" stick-to-edges>
      <template #anchor>
        <VaButton
          preset="secondary"
          color="textPrimary"
          icon="account_circle"
          icon-right="arrow_drop_down"
        >
          <span class="profile-dropdown__anchor min-w-max">
            <slot />
            {{ fullName }}
          </span>
        </VaButton>
      </template>
      <VaDropdownContent
        class="profile-dropdown__content md:w-60 px-0 pt-4 w-full"
        :style="{ '--hover-color': hoverColor }"
      >
        <VaList v-for="group in options" :key="group.name">
          <header
            v-if="group.name"
            class="uppercase text-[var(--va-secondary)] opacity-80 font-bold text-xs px-4 mb-1"
          >
            {{ t(`user.${group.name}`) }}
          </header>
          <VaListItem
            v-for="item in group.list"
            :key="item.name"
            class="menu-item px-4 text-base cursor-pointer h-8"
            v-bind="resolveLinkAttribute(item)"
          >
            <VaIcon :name="item.icon" class="pr-1" color="secondary" />
            {{ t(`${item.name}`) }}
          </VaListItem>
          <VaListSeparator v-if="group.separator" class="mx-0 my-2" />
        </VaList>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useColors } from 'vuestic-ui';

import { useUserStore } from '../../../../../../stores/user';

const userStore = useUserStore();

const fullName = computed(
  () => `${userStore.currentUser?.firstName ?? ''} ${userStore.currentUser?.lastName ?? ''}`
);

const { colors, setHSLAColor } = useColors();
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }));

const { t } = useI18n();

type ProfileListItem = {
  name: string;
  to?: string;
  href?: string;
  icon: string;
};

type ProfileOptions = {
  name: string;
  separator: boolean;
  list: ProfileListItem[];
};

withDefaults(
  defineProps<{
    options?: ProfileOptions[];
  }>(),
  {
    options: () => [
      {
        name: 'account',
        separator: true,
        list: [
          {
            name: 'profile',
            to: 'user-profile',
            icon: 'mso-account_circle',
          },
        ],
      },
      {
        name: '',
        separator: false,
        list: [
          {
            name: 'logout',
            to: 'logout',
            icon: 'mso-logout',
          },
        ],
      },
    ],
  }
);

const isShown = ref(false);

const resolveLinkAttribute = (item: ProfileListItem) => {
  if (item.to) {
    return { to: { name: item.to } };
  }
  if (item.href) {
    return { href: item.href, target: '_blank' };
  }

  return {};
};
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    .menu-item:hover {
      background: var(--hover-color);
    }
  }

  &__anchor {
    display: inline-block;
  }
}
</style>
