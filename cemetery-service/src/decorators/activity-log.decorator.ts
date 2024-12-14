export const ActivityLog = (options: { action: string, label?: string }) => {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
  
      descriptor.value = async function (...args: any[]) {
        // Access the class instance (which should have ActivityService injected)
        const activityService = this.activityService; // Assumes activityService is injected in the class
  
        if (!activityService) {
          throw new Error('ActivityService is not available in this context.');
        }
  
        // Call the original method and await its result
        const result = await originalMethod.apply(this, args);
  
        // Log the activity after the original method execution
        await activityService.logActivity(options.action, options.label).catch((err) => {
          console.error(`Error logging activity: ${err.message}`);
        });
  
        return result;
      };
    };
  };