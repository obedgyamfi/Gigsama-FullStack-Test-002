import ChatInterface from "@/components/chat/ChatInterface";

/**
 * ProjectPage component - Renders the chat interface for a specific project.
 * This is a Next.js dynamic route page that uses the projectId from params.
 * 
 * @param {Object} params - The params object containing a Promise with projectId.
 * @param {Promise<{ projectId: string }>} params.params - A Promise resolving to an object with projectId.
 */
export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  // Await the params Promise to extract the projectId from the dynamic route
  const { projectId } = await params;

  // Render the ChatInterface component, passing the projectId as an initial prop
  return <ChatInterface initialProjectId={projectId} />;
}
