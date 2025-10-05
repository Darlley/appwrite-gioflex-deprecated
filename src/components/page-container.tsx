import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from './ui/breadcrumb';
import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';
import { cn } from '@/lib/utils';

export default function PageContainer({
  children,
  title,
  className
}: {
  children: React.ReactNode
  title: string
  className?: string
}) {
  return (
    <>
      <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className={cn(className, "w-full")}>
        {children}
      </div>
    </>
  )
}
