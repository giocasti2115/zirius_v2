'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

// Temporary stub for drawer components - will be replaced with proper drawer implementation
const DrawerStub = ({ children, ...props }: any) => <div {...props}>{children}</div>

function Drawer(props: any) {
  return <DrawerStub data-slot="drawer" {...props} />
}

function DrawerTrigger(props: any) {
  return <DrawerStub data-slot="drawer-trigger" {...props} />
}

function DrawerPortal(props: any) {
  return <DrawerStub data-slot="drawer-portal" {...props} />
}

function DrawerClose(props: any) {
  return <DrawerStub data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: any) {
  return (
    <DrawerStub
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      data-slot="drawer-overlay"
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: any) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerStub
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
          className
        )}
        data-slot="drawer-content"
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </DrawerStub>
    </DrawerPortal>
  )
}

function DrawerHeader({
  className,
  ...props
}: any) {
  return (
    <div
      className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
      data-slot="drawer-header"
      {...props}
    />
  )
}

function DrawerFooter({
  className,
  ...props
}: any) {
  return (
    <div
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      data-slot="drawer-footer"
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: any) {
  return (
    <DrawerStub
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      data-slot="drawer-title"
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: any) {
  return (
    <DrawerStub
      className={cn('text-sm text-muted-foreground', className)}
      data-slot="drawer-description"
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}