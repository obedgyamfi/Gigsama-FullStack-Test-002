// components/utils/animationVariants.ts

/**
 * Animation variants for Framer Motion components.
 * Defines reusable animation states and transitions for different UI elements.
 */
export const variants = {
  /**
   * Message animation variant - Used for chat message animations.
   * Provides a fade-in and slide-up effect with staggered delays.
   */
  message: {
    hidden: { opacity: 0, y: 10 }, // Initial state: invisible and slightly below
    visible: (index: number) => ({
      opacity: 1, // Final state: fully visible
      y: 0, // Final position: at original position
      transition: {
        delay: index * 0.15, // Staggered delay based on index
        duration: 0.4, // Animation duration in seconds
        ease: "easeOut", // Easing function for smooth finish
      },
    }),
  },

  /**
   * Table animation variant - Used for schema table animations.
   * Provides a fade-in and slide-up effect with staggered delays.
   */
  table: {
    hidden: { opacity: 0, y: 20 }, 
    visible: (index: number) => ({
      opacity: 1, 
      y: 0,
      transition: {
        delay: index * 0.1, 
        duration: 0.3, 
        ease: "easeInOut", 
      },
    }),
  },

  /**
   * Welcome container animation variant - Used for the welcome message container.
   * Provides a fade-in and slide-up effect with staggered children animations.
   */
  welcomeContainer: {
    hidden: { opacity: 0, y: 20 }, 
    visible: {
      opacity: 1, 
      y: 0, 
      transition: {
        staggerChildren: 0.2, 
        duration: 0.5, 
        ease: "easeInOut", 
      },
    },
  },

  /**
   * Welcome text animation variant - Used for welcome message text elements.
   * Provides a simple fade-in and slide-up effect.
   */
  welcomeText: {
    hidden: { opacity: 0, y: 10 }, 
    visible: {
      opacity: 1, 
      y: 0, 
      transition: {
        duration: 0.5, 
        ease: "easeOut", 
      },
    },
  },
};