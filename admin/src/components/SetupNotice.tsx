export default function SetupNotice() {
  return (
    <div className="m-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-base font-semibold text-amber-700">
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
