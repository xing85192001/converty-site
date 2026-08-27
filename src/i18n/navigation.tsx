import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
import { type ComponentProps } from "react";

const intlNav = createNavigation(routing);

// Next.js 16 + `output: "export"` emits broken RSC prefetch URLs under the
// `[locale]` dynamic segment (e.g. `/_next.$d$locale/.../__PAGE__.txt`) which
// 404 and corrupt React hydration (#418 / insertBefore crashes). Force
// `prefetch={false}` on every <Link> so the client never requests them.
function Link(props: ComponentProps<typeof intlNav.Link>) {
  return <intlNav.Link prefetch={false} {...props} />;
}

export { Link };
export const { redirect, usePathname, useRouter, getPathname } = intlNav;
export { routing } from "./routing";
