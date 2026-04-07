import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ShortcutCheatSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShortcutCheatSheet({ open, onOpenChange }: ShortcutCheatSheetProps) {
  const shortcuts = [
    {
      category: "Global",
      items: [
        { keys: ["⌘", "K"], description: "Open Command Palette" },
      ]
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                {category.category}
              </h3>
              <div className="grid gap-2">
                {category.items.map((item) => (
                  <div key={item.description} className="flex items-center justify-between">
                    <span className="text-sm">{item.description}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key) => (
                        <kbd key={key} className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
