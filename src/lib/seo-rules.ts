export function validateTitle(title: string): boolean {
  return title.length >= 30 && title.length <= 60;
}

export function validateDescription(description: string): boolean {
  return description.length >= 140 && description.length <= 160;
}
