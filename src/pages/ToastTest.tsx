import { Button } from "@/components/ui/button";
import { showAuthToast } from "@/lib/toast-notifications";

/**
 * Simple test page to verify toast notifications work
 */
export default function ToastTest() {
  const handleClick = () => {
    console.log('🧪 TEST: Button clicked - triggering toast');
    showAuthToast();
    console.log('🧪 TEST: showAuthToast() called');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Toast Notification Test</h1>
        <p className="text-muted-foreground">Click the button below to test the toast</p>
        
        <Button 
          onClick={handleClick}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          🧪 Test Toast Notification
        </Button>

        <div className="mt-8 p-6 bg-card rounded-lg border border-border max-w-md">
          <h2 className="font-semibold mb-4">Expected Result:</h2>
          <ul className="text-left text-sm text-muted-foreground space-y-2">
            <li>✅ Console log: "🧪 TEST: Button clicked"</li>
            <li>✅ Console log: "🔒 Toast triggered!"</li>
            <li>✅ Orange toast appears top-right</li>
            <li>✅ Shows lock icon and message</li>
            <li>✅ Auto-dismisses after 5 seconds</li>
          </ul>
        </div>

        <div className="mt-6">
          <p className="text-xs text-muted-foreground">
            Open browser console to see debug logs
          </p>
        </div>
      </div>
    </div>
  );
}
