export default function SetupNotice() {
  return (
    <div className="m-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
      <h2 className="text-base font-semibold text-amber-300">
        Supabase henüz yapılandırılmadı
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Verileri görüntülemek için <code>admin/.env.local</code> dosyasına
        Supabase bilgilerinizi ekleyin ve sunucuyu yeniden başlatın. Adımlar için
        depodaki <code>admin/KURULUM.md</code> dosyasına bakın.
      </p>
    </div>
  );
}
