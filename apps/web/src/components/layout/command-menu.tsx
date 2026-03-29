import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Command } from "cmdk"
import { 
  Inbox, 
  Calendar, 
  Search, 
  LayoutDashboard, 
  Plus, 
  Layers
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CommandMenuProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const navigate = useNavigate()

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            <Command.Group heading="Navigation" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              <CommandItem
                onSelect={() => runCommand(() => navigate("/inbox"))}
              >
                <Inbox className="mr-2 h-4 w-4" />
                <span>Go to Inbox</span>
                <CommandShortcut>G I</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate("/today"))}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>Go to Today</span>
                <CommandShortcut>G T</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate("/board"))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Go to Board</span>
                <CommandShortcut>G B</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate("/projects"))}
              >
                <Layers className="mr-2 h-4 w-4" />
                <span>Go to Projects</span>
                <CommandShortcut>G P</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate("/search"))}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
                <CommandShortcut>G S</CommandShortcut>
              </CommandItem>
            </Command.Group>
            <Command.Group heading="Actions" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              <CommandItem
                onSelect={() => runCommand(() => navigate("/"))}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create Task / Capture</span>
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandItem({ 
  children, 
  className, 
  ...props 
}: React.ComponentProps<typeof Command.Item>) {
  return (
    <Command.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </Command.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
