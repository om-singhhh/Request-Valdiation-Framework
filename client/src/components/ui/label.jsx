import * as React from 'react';
import { cn } from '../../lib/utils.js';

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-xs font-medium uppercase tracking-widest text-white/45', className)}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
