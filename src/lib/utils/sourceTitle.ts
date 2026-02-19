const SOURCE_TITLES: Record<string, string> = {
  wideformat: 'Широкоформатная печать',
  baget: 'Багет',
  contacts: 'Контакты',
  outdoor: 'Наружная реклама',
  'heat-transfer': 'Термоперенос',
  'plotter-cutting': 'Плоттерная резка',
  main: 'Главная страница',
};

export function sourceTitle(source: string): string {
  return SOURCE_TITLES[source] || source;
}
