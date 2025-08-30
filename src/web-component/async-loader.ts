let styleSheetLoad: () => Promise<CSSStyleSheet> = async () => {
  const css = await fetch(new URL('./styles.css', import.meta.url)).then(r => r.text())
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  styleSheetLoad = () => Promise.resolve(sheet)
  return sheet
}

export const loadStyles = () => styleSheetLoad()