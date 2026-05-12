"use client";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import styles from "./page.module.css";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Error logging in:", error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Цифровий Гардероб</h1>
        <p className={styles.subtitle}>Увійдіть, щоб створити свою колекцію образів</p>
        
        <Button 
          variant="primary" 
          style={{ width: "100%", padding: "12px", fontSize: "16px", marginTop: "20px" }}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? "Завантаження..." : "Увійти через Google"}
        </Button>
      </div>
    </div>
  );
}
