'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  /**
   * When true, match only exact pathname.
   * When false/undefined, treat as prefix match (e.g. /machines/xxx).
   */
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: '公司介紹', exact: true },
  { href: '/environment', label: '環境介紹' },
  { href: '/machines', label: '機器介紹' },
  { href: '/portfolio', label: '場佈展示' },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  if (item.href === '/') return pathname === '/';
  return pathname === item.href || pathname.startsWith(item.href + '/');
}

export default function TopNav() {
  const pathname = usePathname() || '/';
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const activeHref = useMemo(() => {
    const found = NAV_ITEMS.find((it) => isActive(pathname, it));
    return found?.href ?? '/';
  }, [pathname]);

  const [indicator, setIndicator] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
  }>({ left: 0, top: 0, width: 0, height: 0, ready: false });

  useEffect(() => {
    const update = () => {
      const navEl = navRef.current;
      const activeEl = itemRefs.current[activeHref];
      if (!navEl || !activeEl) return;

      const navRect = navEl.getBoundingClientRect();
      const itemRect = activeEl.getBoundingClientRect();

      // Position relative to the nav container
      const left = itemRect.left - navRect.left;
      const top = itemRect.top - navRect.top;

      setIndicator({
        left,
        top,
        width: itemRect.width,
        height: itemRect.height,
        ready: true,
      });
    };

    // 1) measure after paint
    const raf = requestAnimationFrame(update);

    // 2) re-measure on resize / font load / wrap changes
    window.addEventListener('resize', update);

    // 3) observe nav size changes (wrap / responsive)
    const ro = navRef.current ? new ResizeObserver(() => update()) : null;
    if (ro && navRef.current) ro.observe(navRef.current);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [activeHref]);

  return (
    <nav
      ref={navRef}
      className="relative flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm md:text-base"
      aria-label="Top Navigation"
    >
      {/* sliding indicator (pill) */}
      <span
        aria-hidden
        className={
          'pointer-events-none absolute rounded-full bg-white/10 ring-1 ring-white/15 ' +
          'transition-[left,top,width,height,opacity] duration-300 ease-out'
        }
        style={{
          left: indicator.left,
          top: indicator.top,
          width: indicator.width,
          height: indicator.height,
          opacity: indicator.ready ? 1 : 0,
        }}
      />

      {NAV_ITEMS.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => {
              itemRefs.current[item.href] = el;
            }}
            className={
              'relative z-10 inline-flex items-center justify-center ' +
              'px-2.5 py-1 rounded-full md:px-3 ' +
              'text-white/80 hover:text-white hover:bg-white/10 ' +
              'transition-colors duration-200 ' +
              (active ? 'text-white' : '')
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
