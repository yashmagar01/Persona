import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, FileText, TrendingUp, Target, Bell, Sparkles, CheckCircle, Calendar, ArrowRight } from "lucide-react";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Left Sidebar */}
        <Sidebar className="border-r border-border bg-background" collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#persona" className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        <span>Persona Card</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#assessments" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Assessments</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#progress" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Progress</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Learning</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/learning-path" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Learning Path</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/skill-persona" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Skill Persona</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here's your learning overview.</p>
              </div>
              <SidebarTrigger className="md:hidden" />
            </div>

            {/* Persona Card */}
            <Card id="persona" className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  Your Skill Persona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Problem Solver</Badge>
                  <Badge variant="secondary">Critical Thinker</Badge>
                  <Badge variant="secondary">Team Player</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <Button variant="outline" size="sm">
                  View Full Persona <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">12</div>
                  <p className="text-sm text-muted-foreground">Completed this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">48</div>
                  <p className="text-sm text-muted-foreground">Total hours invested</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills Acquired</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">23</div>
                  <p className="text-sm text-muted-foreground">Verified skills</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Assessments */}
            <Card id="assessments">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "JavaScript Fundamentals", score: 85, date: "2 days ago" },
                    { name: "React Best Practices", score: 92, date: "1 week ago" },
                    { name: "Problem Solving", score: 78, date: "2 weeks ago" },
                  ].map((assessment) => (
                    <div key={assessment.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">{assessment.name}</p>
                        <p className="text-sm text-muted-foreground">{assessment.date}</p>
                      </div>
                      <Badge variant={assessment.score >= 85 ? "default" : "secondary"}>
                        {assessment.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Section */}
            <Card id="progress">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { skill: "Frontend Development", progress: 75 },
                    { skill: "Data Structures", progress: 60 },
                    { skill: "System Design", progress: 45 },
                  ].map((item) => (
                    <div key={item.skill} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.skill}</span>
                        <span className="font-medium">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 border-l border-border bg-background p-6 space-y-6 overflow-y-auto">
          {/* Motivational Tip */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Daily Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                "Success is not final, failure is not fatal: it is the courage to continue that counts."
              </p>
              <p className="text-xs text-muted-foreground mt-2">— Winston Churchill</p>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { task: "Complete React Assessment", time: "Tomorrow" },
                  { task: "Review Data Structures", time: "In 3 days" },
                  { task: "Team Project Deadline", time: "Next week" },
                ].map((item) => (
                  <div key={item.task} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.task}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Start New Assessment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Update Learning Goals
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <UserCircle className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
