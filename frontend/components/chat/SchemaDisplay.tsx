// components/chat/SchemaDisplay.tsx
"use client"; // Marks this as a Client Component in Next.js

import { motion } from "framer-motion"; // Framer Motion for animation effects
import { variants } from "../utils/animationVariants"; // Custom animation variants for schema tables
import { Schema } from "../types/chatTypes"; // Type definition for schema data

/**
 * Props interface for the SchemaDisplay component.
 * Defines the properties for rendering schema data.
 * 
 * @interface SchemaDisplayProps
 * @property {Schema | null} schema - The schema object to display, or null if none.
 */
interface SchemaDisplayProps {
  schema: Schema | null;
}

/**
 * SchemaDisplay component - Renders a visual representation of a database schema.
 * This is a client-side component that displays tables and their fields with animations.
 * 
 * @param {SchemaDisplayProps} props - The props containing the schema data.
 */
export default function SchemaDisplay({ schema }: SchemaDisplayProps) {
  // Return null if no schema is provided
  if (!schema) return null;

  return (
    // Container for schema tables with flexible wrapping
    <div className="w-full max-w-6xl flex flex-wrap gap-6">
      {/* Iterate over schema entries (tableName and fields) */}
      {Object.entries(schema).map(([tableName, fields], index) => (
        <motion.div
          key={tableName} // Unique key for React reconciliation
          variants={variants.table} // Animation variants for table entry
          initial="hidden" // Starting animation state
          animate="visible" // Ending animation state
          custom={index} // Custom index for staggered animation
          className="border border-gray-200 min-w-[200px] max-w-[250px]" // Styling for table card
        >
          {/* Table name header */}
          <h3 className="text-base text-lg font-semibold text-left p-3 text-gray-900 border-b bg-gray-100 border-gray-200 pb-2 mb-2 capitalize">
            {tableName}
          </h3>

          {/* Fields list */}
          <div className="space-y-6 p-3">
            {/* Iterate over field entries (field name and type) */}
            {Object.entries(fields).map(([field, type]) => (
              <div key={field} className="flex justify-between text-lg">
                <span className="text-gray-900 text-semibold">{field}</span>
                <span className="text-gray-500">{type}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}