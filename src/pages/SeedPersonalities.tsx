import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Info } from "lucide-react";

const personalities = [
  {
    slug: 'mahatma-gandhi',
    display_name: 'Mahatma Gandhi',
    era: '1869 - 1948',
  },
  {
    slug: 'shivaji-maharaj',
    display_name: 'Chhatrapati Shivaji Maharaj',
    era: '1630 - 1680',
  },
  {
    slug: 'apj-abdul-kalam',
    display_name: 'Dr. APJ Abdul Kalam',
    era: '1931 - 2015',
  },
  {
    slug: 'rani-lakshmibai',
    display_name: 'Rani Lakshmibai of Jhansi',
    era: '1828 - 1858',
  },
  {
    slug: 'chanakya',
    display_name: 'Chanakya (Kautilya)',
    era: '375 BCE - 283 BCE',
  },
  {
    slug: 'swami-vivekananda',
    display_name: 'Swami Vivekananda',
    era: '1863 - 1902',
  },
  {
    slug: 'bhagat-singh',
    display_name: 'Bhagat Singh',
    era: '1907 - 1931',
  },
  {
    slug: 'savitribai-phule',
    display_name: 'Savitribai Phule',
    era: '1831 - 1897',
  },
  {
    slug: 'subhas-chandra-bose',
    display_name: 'Netaji Subhas Chandra Bose',
    era: '1897 - 1945',
  },
  {
    slug: 'rani-durgavati',
    display_name: 'Rani Durgavati',
    era: '1524 - 1564',
  }
];

const SeedPersonalities = () => {
  const handleSeed = () => {
    toast.info(
      "Database seeding is now done via SQL script. Please run 'scripts/init-turso-db.sql' in your Turso dashboard.",
      { duration: 6000 }
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seed Historical Personalities</CardTitle>
            <CardDescription>
              Add {personalities.length} Indian historical figures to your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Database Migration Notice</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This app now uses <strong>Turso database</strong>. To seed personalities, run the SQL script:
                </p>
                <code className="block bg-muted p-2 rounded mt-2 text-sm">
                  scripts/init-turso-db.sql
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Go to your Turso Dashboard → Shell → Paste and run the SQL contents.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleSeed}
              size="lg"
              className="w-full"
              variant="secondary"
            >
              How to Seed Database
            </Button>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Personalities to be added:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {personalities.map((p) => (
                  <li key={p.slug}>{p.display_name} ({p.era})</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedPersonalities;
