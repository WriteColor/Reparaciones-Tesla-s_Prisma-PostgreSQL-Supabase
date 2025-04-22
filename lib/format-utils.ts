import type React from "react"

export function formatIdentity(value: string): string {
  if (!value) return value

  const numbers = value.replace(/\D/g, "")
  
  if (numbers.length <= 4) {
    return numbers
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`
  } else {
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 13)}`
  }
}

export function formatPhoneNumber(value: string): string {
  if (!value) return value

  const numbers = value.replace(/\D/g, "").slice(0, 8)
  
  return numbers.length <= 4 
    ? numbers 
    : `${numbers.slice(0, 4)}-${numbers.slice(4)}`
}

export function removeFormatting(value: string): string {
  return value ? value.replace(/\D/g, "") : value
}

function adjustCursorPosition(
  input: HTMLInputElement, 
  selectionStart: number | null, 
  formatted: string, 
  originalValue: string,
  positions: number[]
): void {
  if (selectionStart === null) return
  
  setTimeout(() => {
    const cursorPos = selectionStart

    const shouldAdjustCursor = positions.some(pos => 
      cursorPos === pos + 1 && 
      formatted.charAt(pos) === "-" && 
      originalValue.charAt(pos) !== "-"
    )
    
    input.setSelectionRange(
      shouldAdjustCursor ? cursorPos + 1 : cursorPos,
      shouldAdjustCursor ? cursorPos + 1 : cursorPos
    )
  }, 0)
}

export function handleIdentityChange(
  e: React.ChangeEvent<HTMLInputElement>, 
  onChange: (value: string) => void
): void {
  const input = e.target
  const selectionStart = input.selectionStart
  const value = input.value
  
  const numbers = removeFormatting(value)
  const limitedNumbers = numbers.slice(0, 13)
  const formatted = formatIdentity(limitedNumbers)
  
  onChange(formatted)
  
  adjustCursorPosition(input, selectionStart, formatted, value, [4, 9])
}

export function handlePhoneChange(
  e: React.ChangeEvent<HTMLInputElement>, 
  onChange: (value: string) => void
): void {
  const input = e.target
  const selectionStart = input.selectionStart
  const value = input.value
  
  const numbers = removeFormatting(value)
  const limitedNumbers = numbers.slice(0, 8)
  const formatted = formatPhoneNumber(limitedNumbers)
  
  onChange(formatted)
  
  adjustCursorPosition(input, selectionStart, formatted, value, [4])
}
