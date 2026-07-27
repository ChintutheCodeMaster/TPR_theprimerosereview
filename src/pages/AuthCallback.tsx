import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PENDING_SIGNUP_ROLE_KEY } from '@/components/auth/GoogleSignInButton';

const STUDENT_DESTINATION = '/student-guide';

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
      const pendingSignupRole = sessionStorage.getItem(PENDING_SIGNUP_ROLE_KEY);

      setStatus('Loading your workspace…');
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      let role = roleRow?.role as string | undefined;

      if (!role && pendingSignupRole === 'student') {
        setStatus('Setting up your student account…');

        const { error: roleInsertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'student' });

        if (roleInsertError) {
          sessionStorage.removeItem(PENDING_SIGNUP_ROLE_KEY);
          await supabase.auth.signOut();
          toast.error(roleInsertError.message ?? 'Could not create your account.');
          navigate('/signup', { replace: true });
          return;
        }

        const { error: profileInsertError } = await supabase
          .from('student_profiles')
          .insert({ user_id: user.id });

        if (profileInsertError && profileInsertError.code !== '23505') {
          console.error('Failed to seed student_profiles:', profileInsertError);
        }

        role = 'student';
        sessionStorage.removeItem(PENDING_SIGNUP_ROLE_KEY);
      }

      sessionStorage.removeItem(PENDING_SIGNUP_ROLE_KEY);

      // signInWithOAuth silently creates an auth.users row for any Google email.
      // Reject anyone landing here without a role and without a pending signup intent.
      if (!role) {
        await supabase.auth.signOut();
        toast.error('No Primrose account found for this Google email. Please sign up first.');
        navigate('/login', { replace: true });
        return;
      }

      if (role !== 'student') {
        await supabase.auth.signOut();
        toast.error('Primrose is now a student-only platform. This account is not a student.');
        navigate('/login', { replace: true });
        return;
      }

      navigate(STUDENT_DESTINATION, { replace: true });
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
