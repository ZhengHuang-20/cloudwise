# 分享图字体

`src/site/og.tsx` 生成页面分享图（`/og/<lang>/<路径>`）时使用的字体。

- 字体：Noto Sans SC（思源黑体），400 与 600 两个字重，许可证 SIL Open Font License 1.1（`OFL.txt`）。
- 来源：npm 包 `@expo-google-fonts/noto-sans-sc`（0.4.4）里的 `NotoSansSC_400Regular.ttf`、`NotoSansSC_600SemiBold.ttf`。
- 裁剪范围：GB2312 全部字符（含 6763 个常用汉字）、ASCII 与常用中文标点，每个文件约 2.2 MB。完整字体约 10 MB，这里只保留标题会用到的字。

标题里出现裁剪范围外的字（分享图上显示为空白）时，把字加进字符表后重新裁剪：

```bash
pip install fonttools
npm pack @expo-google-fonts/noto-sans-sc@0.4.4 && tar -xzf expo-google-fonts-noto-sans-sc-0.4.4.tgz
python3 - <<'PY'
chars = set()
for hi in range(0xA1, 0xF8):
    for lo in range(0xA1, 0xFF):
        try: chars.add(bytes([hi, lo]).decode('gb2312'))
        except UnicodeDecodeError: pass
chars.update(chr(c) for c in range(0x20, 0x7F))
chars.update('·—–‘’“”…、。〈〉《》「」『』【】〔〕！（），．：；？～￥％＋－＝×÷→←↑↓✓©®™°±≤≥€£')
chars.update('')  # 在这里补充缺的字
open('chars.txt', 'w').write(''.join(sorted(chars)))
PY
for w in 400Regular:Regular 600SemiBold:SemiBold; do
  pyftsubset "package/${w%%:*}/NotoSansSC_${w%%:*}.ttf" --text-file=chars.txt \
    --output-file="NotoSansSC-${w##*:}-subset.ttf" --layout-features='kern,liga,palt' --no-hinting --desubroutinize
done
```
