import NextLink from "next/link"
import type { ComponentProps } from "react"

export default function Link({ children, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink {...props}>{children}</NextLink>
}
