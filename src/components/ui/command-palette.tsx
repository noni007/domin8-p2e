
import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Trophy, Users, TrendingUp, Calendar, Settings, User } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const commands = [
    {
      group: "Navigation",
      items: [
        { label: "Tournaments", icon: Trophy, action: () => window.location.href = "/tournaments" },
        { label: "Leaderboards", icon: TrendingUp, action: () => window.location.href = "/leaderboards" },
        { label: "Rankings", icon: TrendingUp, action: () => window.location.href = "/rankings" },
        { label: "Friends", icon: Users, action: () => window.location.href = "/friends" },
        { label: "Profile", icon: User, action: () => window.location.href = "/profile" },
      ]
    },
    {
      group: "Quick Actions",
      items: [
        { label: "Join Tournament", icon: Calendar, action: () => window.location.href = "/tournaments" },
        { label: "View My Stats", icon: TrendingUp, action: () => window.location.href = "/profile" },
        { label: "Settings", icon: Settings, action: () => window.location.href = "/profile" },
      ]
    }
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl bg-black/90 border-blue-800/30">
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-blue-800/30 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <CommandInput 
              placeholder="Search commands or navigate..." 
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
          </div>
          <CommandList className="max-h-[400px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-gray-400">
              No commands found.
            </CommandEmpty>
            {commands.map((group) => (
              <CommandGroup key={group.group} heading={group.group} className="text-gray-300">
                {group.items.map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => handleSelect(item.action)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-blue-800/20 cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 text-blue-400" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
