'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderKanban, Users } from 'lucide-react';

const ProjectsList = dynamic(() => import('./projects-list').then((m) => ({ default: m.ProjectsList })), { ssr: false });
const ProjectDetail = dynamic(() => import('./project-detail').then((m) => ({ default: m.ProjectDetail })), { ssr: false });
const ResourceAllocation = dynamic(() => import('./resource-allocation').then((m) => ({ default: m.ResourceAllocation })), { ssr: false });

export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Management</h1>
        <p className="text-sm text-muted-foreground">Plan, track, and manage projects and resource allocation</p>
      </div>

      {selectedProjectId ? (
        <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
      ) : (
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects" className="gap-1.5">
              <FolderKanban className="h-3.5 w-3.5" /> Projects
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Resource Allocation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectsList onSelect={(id) => setSelectedProjectId(id)} />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceAllocation />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
