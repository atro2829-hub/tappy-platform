import { useState } from 'react';

import { AppSidebar, SidebarBody } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';
import { Copilot, CopilotLauncher } from '@/components/copilot';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({ children }: AppLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AppSidebar />

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-[264px] gap-0 p-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SidebarBody
                        forceExpanded
                        onNavigate={() => setMobileOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <div className="flex min-w-0 flex-1 flex-col">
                <ImpersonationBanner />
                <AppTopbar onOpenMobile={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>

            <CopilotLauncher />
            <Copilot />
        </div>
    );
}
