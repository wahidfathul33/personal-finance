'use client'

import NextTopLoader from 'nextjs-toploader'
import { useBaseColor, BASE_COLOR_HEX } from './BaseColorProvider'

export default function TopLoader() {
  const { color } = useBaseColor()
  return (
    <NextTopLoader
      color={BASE_COLOR_HEX[color]}
      shadow={false}
      height={3}
      showSpinner={false}
    />
  )
}
