// components/types/chatTypes.ts

/**
 * Schema type - Represents a database schema structure.
 * A nested object where table names map to field names and their data types.
 * 
 * @type {Schema}
 * @property {[tableName: string]: { [fieldName: string]: string }} - Table names mapped to field names and types.
 */
export type Schema = { [tableName: string]: { [fieldName: string]: string } };

/**
 * Message type - Represents a single chat message with question, response, and optional schema.
 * 
 * @type {Message}
 * @property {string} question - The user's question or input.
 * @property {string} response - The response to the question.
 * @property {Schema | null} schema - Optional schema data related to the message.
 */
export type Message = { question: string; response: string; schema: Schema | null };

/**
 * Project type - Represents a project entity with basic metadata.
 * 
 * @type {Project}
 * @property {string} id - Unique identifier for the project.
 * @property {string} name - Name of the project.
 * @property {string} created_at - Timestamp of project creation.
 */
export type Project = { id: string; name: string; created_at: string };

/**
 * Props interface for the ChatInterface component.
 * Defines the optional initial project ID for initializing the chat.
 * 
 * @interface ChatInterfaceProps
 * @property {string} [initialProjectId] - Optional ID of the initial project to load.
 */
export interface ChatInterfaceProps { initialProjectId?: string; }