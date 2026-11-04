import { theme, type ThemeConfig } from 'antd';

/**
 * 后台（/login、/console）使用 antd，主题与官网的浅色薄荷绿 token 对齐（色值同 src/index.css 的 @theme）。
 * 官网页面不使用 antd，规范见 DESIGN.md §10。
 */
const C = {
  canvas: '#f5f7f6',
  sider: '#ffffff',
  surface: '#ffffff',
  surfaceHover: '#f5f9f7',
  raised: '#f0f4f2',
  separator: '#dfe5e2',
  separatorSoft: '#e9eeec',
  label: '#15201b',
  secondary: '#55615c',
  tertiary: '#8a9590',
  accent: '#00845a',
  accentSoft: '#e6f7ef',
  link: '#00774f',
  brand: '#01c886',
  success: '#177a35',
  warning: '#a35300',
  danger: '#c42a24',
};

export const CONSOLE_COLORS = C;

export const consoleTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
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
    boxShadowSecondary: '0 12px 40px rgb(18 38 30 / 0.14)',
    motionEaseInOut: 'cubic-bezier(0.28, 0.11, 0.32, 1)',
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: C.sider,
      headerBg: 'rgb(255 255 255 / 0.85)',
      bodyBg: C.canvas,
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemColor: C.secondary,
      itemHoverColor: C.label,
      itemHoverBg: 'rgb(18 38 30 / 0.04)',
      itemSelectedBg: C.accentSoft,
      itemSelectedColor: C.link,
      itemActiveBg: C.accentSoft,
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
      itemSelectedBg: C.surface,
      itemSelectedColor: C.link,
      trackBg: 'rgb(18 38 30 / 0.06)',
    },
    Tag: {
      defaultBg: 'rgb(18 38 30 / 0.06)',
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
