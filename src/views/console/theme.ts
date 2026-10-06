import { theme, type ThemeConfig } from 'antd';

/**
 * 后台（#/login、#/console）使用 antd，主题与官网的深色 token 对齐（色值同 src/index.css 的 @theme）。
 * 官网页面不使用 antd，规范见 DESIGN.md §10。
 */
const C = {
  canvas: '#000000',
  sider: '#0b0b0c',
  surface: '#1d1d1f',
  surfaceHover: '#242426',
  raised: '#2c2c2e',
  separator: '#38383a',
  separatorSoft: '#2a2a2c',
  label: '#f5f5f7',
  secondary: '#a1a1a6',
  tertiary: '#6e6e73',
  accent: '#0071e3',
  link: '#2997ff',
  success: '#30d158',
  warning: '#ff9f0a',
  danger: '#ff453a',
};

export const CONSOLE_COLORS = C;

export const consoleTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: C.accent,
    colorInfo: C.accent,
    colorLink: C.link,
    colorSuccess: C.success,
    colorWarning: C.warning,
    colorError: C.danger,
    colorBgBase: C.canvas,
    colorBgLayout: C.canvas,
    colorBgContainer: C.surface,
    colorBgElevated: C.raised,
    colorBorder: C.separator,
    colorBorderSecondary: C.separatorSoft,
    colorSplit: C.separatorSoft,
    colorTextBase: C.label,
    colorTextSecondary: C.secondary,
    colorTextTertiary: C.tertiary,
    colorTextDescription: C.secondary,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro SC", "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif',
    // 全站最小字号 14px
    fontSize: 14,
    fontSizeSM: 14,
    fontWeightStrong: 600,
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    controlHeight: 36,
    controlHeightLG: 44,
    boxShadowSecondary: '0 12px 40px rgb(0 0 0 / 0.55)',
    motionEaseInOut: 'cubic-bezier(0.28, 0.11, 0.32, 1)',
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: C.sider,
      headerBg: 'rgb(0 0 0 / 0.72)',
      bodyBg: C.canvas,
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemColor: C.secondary,
      itemHoverColor: C.label,
      itemHoverBg: 'rgb(255 255 255 / 0.05)',
      itemSelectedBg: 'rgb(255 255 255 / 0.09)',
      itemSelectedColor: C.label,
      itemActiveBg: 'rgb(255 255 255 / 0.09)',
      itemBorderRadius: 8,
      itemHeight: 40,
      itemMarginInline: 12,
      groupTitleColor: C.tertiary,
      groupTitleFontSize: 14,
      activeBarBorderWidth: 0,
      iconSize: 16,
    },
    Card: {
      headerFontSize: 15,
      headerHeight: 52,
      bodyPadding: 20,
    },
    Table: {
      // 固定列需要不透明底色，否则横向滚动时下面的内容会透出来
      headerBg: C.surface,
      headerColor: C.secondary,
      headerSplitColor: 'transparent',
      rowHoverBg: C.surfaceHover,
      borderColor: C.separatorSoft,
      cellPaddingBlock: 14,
      footerBg: 'transparent',
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
      fontWeight: 600,
    },
    Statistic: {
      contentFontSize: 30,
      titleFontSize: 14,
    },
    Segmented: {
      itemSelectedBg: C.raised,
      trackBg: 'rgb(118 118 128 / 0.24)',
    },
    Tag: {
      defaultBg: 'rgb(118 118 128 / 0.24)',
      defaultColor: C.label,
    },
    Modal: {
      contentBg: C.surface,
      headerBg: C.surface,
      titleFontSize: 18,
    },
    Drawer: {
      colorBgElevated: C.surface,
    },
    Descriptions: {
      labelColor: C.secondary,
    },
  },
};
