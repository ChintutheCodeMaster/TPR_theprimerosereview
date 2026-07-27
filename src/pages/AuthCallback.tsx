import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const dashboardByRole: Record<string, string> = {
  counselor: '/dashboard',
  student: '/student-guide',
  parent: '/parent-portal',
  principal: '/principal-dashboard',
  teacher: '/teacher-dashboard',
  admin: '/superadmin',
};

export default function AuthCallback() {
  const navigate = useNavigate();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<string>('Finishing sign-in…');

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        toast.error(sessionError?.message ?? 'Sign-in failed.');
        navigate('/login', { replace: true });
        return;
      }

      const user = session.user;

      setStatus('Loading your workspace…');
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      const role = roleRow?.role as string | undefined;

      // signInWithOAuth silently creates an auth.users row for any Google email.
      // Only accept users who have a user_roles row provisioned by the normal
      // signup/invite flows — otherwise sign them out.
      if (!role) {
        await supabase.auth.signOut();
        toast.error('No Primrose account found for this Google email. Please sign up first.');
        navigate('/login', { replace: true });
        return;
      }

      const destination = dashboardByRole[role];
      if (!destination) {
        await supabase.auth.signOut();
        toast.error(`Unknown role: ${role}`);
        navigate('/login', { replace: true });
        return;
      }

      navigate(destination, { replace: true });
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col items-center justify-center p-6">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="mt-4 text-sm font-medium text-foreground">{status}</p>
      <p className="mt-1 text-xs text-muted-foreground">Hang tight — this only takes a moment.</p>
    </div>
  );
}
