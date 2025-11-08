import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showAuthToast, showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from "@/lib/toast-notifications";
import { MessageSquare, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Demo page to showcase the toast notification system
 * Shows different toast types with the orange theme
 */
export default function ToastDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
            Toast Notification System
          </h1>
          <p className="text-muted-foreground">
            Click the buttons below to test different toast notifications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Auth Toast */}
          <Card className="shadow-lg border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                Authentication Toast
              </CardTitle>
              <CardDescription>
                Shows when users need to sign in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={showAuthToast}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Show Auth Required
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  • Top-right position<br/>
                  • 5 second auto-dismiss<br/>
                  • Close button<br/>
                  • Orange info icon<br/>
                  • Smooth slide animation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Success Toast */}
          <Card className="shadow-lg border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Success Toast
              </CardTitle>
              <CardDescription>
                Shows successful actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => showSuccessToast("Account created successfully!")}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Show Success
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  • Orange checkmark icon<br/>
                  • 3 second auto-dismiss<br/>
                  • Success feedback
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error Toast */}
          <Card className="shadow-lg border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Error Toast
              </CardTitle>
              <CardDescription>
                Shows error messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => showErrorToast("Something went wrong. Please try again.")}
                variant="destructive"
                className="w-full"
              >
                Show Error
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  • Red error icon<br/>
                  • 4 second auto-dismiss<br/>
                  • Error feedback
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Toast */}
          <Card className="shadow-lg border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Info Toast
              </CardTitle>
              <CardDescription>
                Shows informational messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => showInfoToast("Your changes have been saved automatically")}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Show Info
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  • Blue info icon<br/>
                  • 3 second auto-dismiss<br/>
                  • Informational feedback
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Warning Toast */}
          <Card className="shadow-lg border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Warning Toast
              </CardTitle>
              <CardDescription>
                Shows warning messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => showWarningToast("Your session will expire soon")}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                Show Warning
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  • Yellow warning icon<br/>
                  • 3 second auto-dismiss<br/>
                  • Warning feedback
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Multiple Toasts */}
          <Card className="shadow-lg border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Multiple Toasts
              </CardTitle>
              <CardDescription>
                Stack multiple notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  showInfoToast("Processing your request...");
                  setTimeout(() => showSuccessToast("Request completed!"), 1500);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Show Multiple
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  • Toasts stack vertically<br/>
                  • Auto-positioning<br/>
                  • Independent timers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-lg border-orange-500/20">
          <CardHeader>
            <CardTitle>Toast Features</CardTitle>
            <CardDescription>All toasts include these features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Design</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Dark theme styling</li>
                  <li>✅ Orange accent colors</li>
                  <li>✅ Backdrop blur effect</li>
                  <li>✅ Shadow and borders</li>
                  <li>✅ Responsive design</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Functionality</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Smooth slide-in animation</li>
                  <li>✅ Auto-dismiss timers</li>
                  <li>✅ Manual close button</li>
                  <li>✅ Click outside to dismiss</li>
                  <li>✅ Accessible (ARIA labels)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
