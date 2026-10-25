
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getPortfolioItems } from "@/utils/supabase/portfolio";
import type { PortfolioItem } from "@/utils/supabase/portfolio";

type EducationItem = {
  id: string;
  qualification?: string;
  institution?: string;
  period?: string;
  grade?: string;
  description?: string;
  highlights?: string[];
  image_url?: string | null;
};

type CertificationItem = {
  id: string;
  name?: string;
  provider?: string;
  status?: string;
  issue_date?: string;
  credential_id?: string;
  image_url?: string | null;
  link?: string;
};

type SkillCategory = {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  items: string[];
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [experience, setExperience] = useState<PortfolioItem[]>([]);
  const [achievements, setAchievements] = useState<PortfolioItem[]>([]);
  const [profile, setProfile] = useState<PortfolioItem | null>(null);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const [projectItems, profileItems, skillItems, educationItems, certItems, experienceItems, achievementItems] =
          await Promise.all([
            getPortfolioItems("projects"),
            getPortfolioItems("profile"),
            getPortfolioItems("skills"),
            getPortfolioItems("education"),
            getPortfolioItems("certifications"),
            getPortfolioItems("experience"),
            getPortfolioItems("achievements"),
          ]);

        setProjects(projectItems);
        setExperience(experienceItems);
        setAchievements(achievementItems);
        setProfile(profileItems.find((item) => item.slug === "kavinbharathi-profile") ?? profileItems[0] ?? null);

        // Backward-compatible: older rows store an items array; new rows can
        // each represent one category, education record, or certification.
        const normalizedSkills: SkillCategory[] = skillItems.flatMap((row) => {
          const items = row.content.items;
          if (Array.isArray(items)) {
            const strings = items.filter((value): value is string => typeof value === "string");
            if (strings.length) return [{ id: row.id, title: row.title || "Core capabilities", icon: String(row.content.icon ?? "sparkles"), description: row.description ?? "", items: strings }];
          }
          const categoryItems = row.content.skills;
          if (Array.isArray(categoryItems)) {
            return [{ id: row.id, title: row.title, icon: String(row.content.icon ?? "sparkles"), description: row.description ?? "", items: categoryItems.filter((value): value is string => typeof value === "string") }];
          }
          return [];
        });
        setSkills(normalizedSkills);

        const normalizedEducation: EducationItem[] = educationItems.flatMap((row) => {
          const entries = row.content.items;
          if (Array.isArray(entries)) {
            return entries.filter((value): value is Record<string, unknown> => typeof value === "object" && value !== null).map((value, index) => ({
              id: `${row.id}-${index}`,
              qualification: String(value.qualification ?? ""),
              institution: String(value.institution ?? ""),
              period: typeof value.period === "string" ? value.period : undefined,
              grade: typeof value.grade === "string" ? value.grade : undefined,
              description: typeof value.description === "string" ? value.description : undefined,
              highlights: Array.isArray(value.highlights) ? value.highlights.filter((x): x is string => typeof x === "string") : [],
              image_url: typeof value.image_url === "string" ? value.image_url : row.image_url,
            }));
          }
          return [{ id: row.id, qualification: row.title, institution: String(row.content.institution ?? ""), period: typeof row.content.period === "string" ? row.content.period : undefined, grade: typeof row.content.grade === "string" ? row.content.grade : undefined, description: row.description ?? undefined, highlights: Array.isArray(row.content.highlights) ? row.content.highlights.filter((x): x is string => typeof x === "string") : [], image_url: row.image_url }];
        }).filter((value) => value.qualification || value.institution);
        setEducation(normalizedEducation);

        const normalizedCertifications: CertificationItem[] = certItems.flatMap((row) => {
          const entries = row.content.items;
          if (Array.isArray(entries)) {
            return entries.filter((value): value is Record<string, unknown> => typeof value === "object" && value !== null).map((value, index) => ({
              id: `${row.id}-${index}`,
              name: String(value.name ?? ""),
              provider: typeof value.provider === "string" ? value.provider : undefined,
              status: typeof value.status === "string" ? value.status : undefined,
              issue_date: typeof value.issue_date === "string" ? value.issue_date : undefined,
              credential_id: typeof value.credential_id === "string" ? value.credential_id : undefined,
              image_url: typeof value.image_url === "string" ? value.image_url : row.image_url,
              link: typeof value.link === "string" ? value.link : undefined,
            }));
          }
          return [{ id: row.id, name: row.title, provider: typeof row.content.provider === "string" ? row.content.provider : undefined, status: typeof row.content.status === "string" ? row.content.status : undefined, issue_date: typeof row.content.issue_date === "string" ? row.content.issue_date : undefined, credential_id: typeof row.content.credential_id === "string" ? row.content.credential_id : undefined, image_url: row.image_url, link: typeof row.content.link === "string" ? row.content.link : undefined }];
        }).filter((value) => value.name);
        setCertifications(normalizedCertifications);
      } catch (error) {
        console.error("Unable to load portfolio:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  const headline = profile?.content.headline
    ? String(profile.content.headline)
    : "I turn complex problems into clear outcomes.";

  const about = profile?.content.about
    ? String(profile.content.about)
    : "I connect business needs, user requirements and technology to deliver practical solutions.";
  const about_me = profile?.content.about_me
    ? String(profile.content.about_me)
    : "I connect business needs, user requirements and technology to deliver practical solutions.";


  const role = profile?.content.role
    ? String(profile.content.role)
    : "Business Analyst";

  const location = profile?.content.location
    ? String(profile.content.location)
    : "India";

  return (
    <main className="min-h-screen overflow-x-clip bg-[#080908] pt-[78px] text-[#f1f2ec]">
      {/* Navigation */}
      <header className="site-nav fixed inset-x-0 top-0 z-[100] border-b border-white/[0.08] bg-[#080908]/90 backdrop-blur-2xl">
        <nav className="relative mx-auto flex min-h-[78px] max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <a href="#" aria-label="Kavinbharathi Ananth — Home" className="group flex items-center gap-3">
            {profile?.content.navbar_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(profile.content.navbar_image_url)} alt="" className="h-10 w-10 rounded-full border-2 border-[#b7e653]/70 object-cover transition group-hover:scale-105" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b7e653]/40 bg-[#b7e653]/[0.08] text-sm font-bold text-[#b7e653]">KA</span>
            )}
            <span className="hidden text-sm font-medium tracking-tight text-white sm:inline">Kavinbharathi Ananth<span className="text-[#b7e653]">!</span></span>
          </a>

          <button
            className="rounded-full border border-white/15 px-4 py-2 text-sm md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          <div
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute left-0 right-0 top-full flex-col gap-5 border-b border-white/10 bg-[#080908] px-6 py-6 md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0`}
          >
            {[
              ["About", "#about"],
              ["Work", "#work"],
              ["Experience", "#experience"],
              ["Expertise", "#skills"],
              ["Journey", "#journey"],
              ["Highlights", "#achievements"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-white/60 transition hover:text-[#b7e653]"
              >
                {label}
              </a>
            ))}

            <button
              type="button"
              onClick={() => { setMenuOpen(false); setContactOpen(true); }}
              className="btn-primary nav-cta"
            >
              Let&apos;s talk ↗
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <motion.section className="site-atmosphere relative overflow-hidden" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } } }}>
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-35" />
        <div className="glow-orb absolute -right-32 top-16 h-96 w-96" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-20 md:pb-32 md:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
          <motion.div className="relative z-10" variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } }}>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#b7e653]/20 bg-[#80a82d]/[0.08] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b7e653] shadow-[0_0_14px_#b7e653]" />
              <span className="text-[10px] font-medium tracking-[0.16em] text-white/75 sm:text-xs">
                BUSINESS × PRODUCT × TECHNOLOGY
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl md:text-7xl xl:text-[5.2rem]">
              {headline}
            </h1>

            <p className="mt-8 max-w-xl text-base leading-8 text-white/60 md:text-lg">
              {about}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#work"
                className="btn-primary group"
              >
                Explore my work
                <span className="transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              </a>
              <a
                href="#contact"
                className="btn-secondary"
              >
                Let&apos;s connect <span className="text-[#b7e653]">↗</span>
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-7 text-sm text-white/45">
              <span className="flex items-center gap-2">
                <span className="text-[#b7e653]">✳</span> {role}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#b7e653]">⌖</span> {location}
              </span>
            </div>
          </motion.div>

          {/* Decorative approach panel */}
          <motion.div className="relative mx-auto w-full max-w-lg lg:max-w-none" initial={{ opacity: 0, y: 28, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.85, delay: 0.35, ease: "easeOut" }}>
            <div className="absolute inset-8 rounded-full bg-[#80a82d]/20 blur-[90px]" />

            <div className="glass-card relative overflow-hidden rounded-[2rem]">
              <div className="grid-texture absolute inset-0 opacity-25" />

              <div className="relative p-5 sm:p-7">
                <div className="profile-photo-frame group/photo relative mb-7 min-h-[250px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(ellipse_at_70%_20%,rgba(183,230,83,.20),transparent_42%),linear-gradient(135deg,#1a2113,#0c0e0b_65%)] sm:min-h-[310px]">
                  {profile?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.image_url}
                      alt="Portrait of Kavinbharathi Ananth"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/photo:scale-[1.035]"
                      style={{ objectPosition: String(profile.content.imagePosition ?? "center 35%") }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                      <div className="photo-placeholder-icon mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#b7e653]/35 bg-[#b7e653]/10 text-3xl text-[#b7e653]">K.</div>
                      <p className="text-sm font-medium text-white/85">Your portrait goes here</p>
                      <p className="mt-2 max-w-xs text-xs leading-5 text-white/45">Upload a photo to Supabase Storage, then add its public URL to the profile row&apos;s image_url field.</p>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080908]/90 via-transparent to-black/10" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 sm:bottom-5 sm:left-5 sm:right-5">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#d0f78b]">BUSINESS × TECHNOLOGY</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">{profile?.title ?? "Kavinbharathi Ananth"}</p>
                    </div>
                    <span className="rounded-full border border-white/20 bg-black/35 px-3 py-2 text-[10px] text-white/75 backdrop-blur-md">{role}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="eyebrow">THE WAY I THINK</span>
                  <span className="text-2xl text-[#b7e653]">✳</span>
                </div>

                {[
                  {
                    number: "01",
                    title: "Ask better",
                    accent: "questions.",
                    detail: "UNDERSTAND",
                  },
                  {
                    number: "02",
                    title: "Find what",
                    accent: "matters.",
                    detail: "ANALYSE",
                  },
                  {
                    number: "03",
                    title: "Make it",
                    accent: "happen.",
                    detail: "DELIVER",
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="border-b border-white/[0.08] py-7 last:border-0"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-xs text-[#b7e653]">
                        {item.number}
                      </span>
                      <span className="text-[10px] tracking-[0.2em] text-white/35">
                        {item.detail}
                      </span>
                    </div>
                    <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
                      {item.title}{" "}
                      <span className="accent-gradient">{item.accent}</span>
                    </h2>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-3">
                  <span className="text-[10px] tracking-[0.18em] text-white/40">
                    BUSINESS-LED
                  </span>
                  <span className="text-[10px] tracking-[0.18em] text-white/40">
                    DATA-INFORMED ↗
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card absolute -bottom-5 -left-2 rounded-2xl px-5 py-4 sm:-left-6">
              <p className="text-[10px] tracking-[0.2em] text-white/45">
                MY APPROACH
              </p>
              <p className="mt-1 text-sm font-medium">
                <span className="text-[#b7e653]">↗</span> Clarity over complexity.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Expertise strip */}
      <div className="border-y border-white/[0.07] bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-6 lg:px-12">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#b7e653]">
            AREAS OF FOCUS
          </span>
          {[
            "Digital Products",
            "Data & Insights",
            "Requirements",
            "Product Delivery",
          ].map((item) => (
            <span key={item} className="group inline-flex items-center gap-2 rounded-full border border-[#b7e653]/35 bg-[#b7e653]/[0.10] px-4 py-2.5 text-sm font-medium text-[#e5f5c7] shadow-[inset_0_0_0_1px_rgba(183,230,83,.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b7e653]/75 hover:bg-[#b7e653]/[0.18] hover:text-white hover:shadow-[0_0_22px_rgba(183,230,83,.10)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b7e653] shadow-[0_0_8px_rgba(183,230,83,.55)] transition-transform group-hover:scale-125" />{item}
            </span>
          ))}
        </div>
      </div>

      {/* About */}
      <motion.section id="about" className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65 }}>
        <p className="eyebrow mb-5">01 — ABOUT ME</p>

        <div className="grid items-center gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-[#b7e653]/[0.07] blur-2xl" />
            <div className="glass-card relative overflow-hidden rounded-[2rem] p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(ellipse_at_70%_20%,rgba(183,230,83,.18),transparent_42%),linear-gradient(135deg,#1a2113,#0c0e0b_65%)]">
                {typeof profile?.content.about_image_url === "string" && profile.content.about_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.content.about_image_url} alt="About Kavinbharathi" className="h-full w-full object-cover" style={{ objectPosition: String(profile.content.aboutImagePosition ?? "center") }} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#b7e653]/30 bg-[#b7e653]/10"><span className="text-2xl text-[#b7e653]">✳</span></div>
                    <p className="text-lg font-medium">A visual introduction</p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/45">Add <code>about_image_url</code> to the profile content in Supabase.</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080908]/75 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5"><span className="eyebrow">BUSINESS × TECHNOLOGY</span><p className="mt-2 text-xl font-semibold">Curiosity into clarity.</p></div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-7 text-4xl font-medium leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Business context.<br /><span className="text-white/30">Technical curiosity.</span><br /><span className="accent-gradient">Real-world impact.</span>
            </h2>
            <p className="text-base leading-8 text-white/60">{about_me}</p>
            <p className="mt-5 leading-8 text-white/50">
              I enjoy connecting user needs, business objectives and technical
              implementation — from analysing digital product behaviour to
              translating requirements and validating solutions with teams.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="glass-card premium-card rounded-2xl p-5">
                <span className="text-2xl text-[#b7e653]">01</span>
                <p className="mt-2 text-sm text-white/55">Business + Technology</p>
              </div>
              <div className="glass-card premium-card rounded-2xl p-5">
                <span className="text-2xl text-[#b7e653]">02</span>
                <p className="mt-2 text-sm text-white/55">Data + Decisions</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Projects */}
      <motion.section
        id="work"
        className="border-y border-white/[0.07] bg-white/[0.018]"
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.65 }}
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-5">02 — SELECTED WORK</p>
              <h2 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
                Ideas, made tangible.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/45">
              Analytical projects and technical experiments, presented with
              the problems they aim to solve.
            </p>
          </div>

          {loadError && (
            <p className="mb-6 text-sm text-red-300">
              Portfolio content could not be loaded. Please try refreshing.
            </p>
          )}

          {loading ? (
            <p className="text-white/50">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-white/50">
              No published projects yet. Add projects in Supabase to display them.
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {projects.map((project, index) => (
                <motion.article
                  key={project.id}
                  className="glass-card premium-card group overflow-hidden rounded-3xl"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                    
                    <div className="relative flex items-center justify-between border-b border-white/[0.07] bg-gradient-to-r from-[#80a82d]/10 via-[#10120f] to-[#080908] px-6 py-4 sm:px-8">
                      <div className="grid-texture absolute inset-0 opacity-20" />

                      <div className="relative flex items-center gap-3">
                        <span className="accent-gradient text-3xl font-light sm:text-4xl">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] font-medium tracking-[0.2em] text-white/40">
                          PROFESSIONAL IMPACT
                        </span>
                      </div>

                      <span className="relative rounded-full border border-[#b7e653]/20 bg-[#b7e653]/5 px-3 py-1.5 text-xs text-[#c9f477]">
                        {project.content.category
                          ? String(project.content.category)
                          : "CAREER HIGHLIGHT"}
                      </span>
                    </div>


                  <div className="p-6 sm:p-8">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <span className="eyebrow">
                        PROFESSIONAL IMPACT
                      </span>
                      <span className="text-xl text-[#b7e653] transition-transform group-hover:translate-x-1">
                        ↗
                      </span>
                    </div>

                    <h3 className="text-2xl font-medium tracking-tight sm:text-3xl">
                      {project.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-white/55">
                      {project.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/65"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Experience — dynamically driven by Supabase rows */}
      {(experience.length > 0 || loading) && (
        <motion.section id="experience" className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6 }}>
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="eyebrow mb-5">03 — EXPERIENCE</p><h2 className="text-4xl font-medium tracking-tight md:text-5xl">Where ideas meet execution.</h2></div>
            <p className="max-w-sm text-sm leading-7 text-white/45">Professional experience, responsibilities and the work behind the outcomes.</p>
          </div>
          {loading ? <p className="text-sm text-white/45">Loading experience…</p> : (
            <div className="grid gap-5 md:grid-cols-2">
              {experience.map((item, index) => (
                <motion.article key={item.id} className="glass-card premium-card group overflow-hidden rounded-3xl" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.08 }}>
                  <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-white/[0.07] bg-[radial-gradient(ellipse_at_70%_20%,rgba(183,230,83,.15),transparent_45%),linear-gradient(135deg,#151b10,#0a0b09)]">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: String(item.content.imagePosition ?? "center") }} />
                    ) : <div className="text-center"><span className="accent-gradient text-5xl">0{index + 1}</span><p className="mt-2 text-[10px] tracking-[.2em] text-white/35">EXPERIENCE VISUAL</p></div>}
                    <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white/70 backdrop-blur">{String(item.content.period ?? "Professional experience")}</span>
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm font-medium text-[#b7e653]">{String(item.content.company ?? "")}</p>
                    {item.description && <p className="mt-4 text-sm leading-7 text-white/55">{item.description}</p>}

                    {Array.isArray(item.content.responsibilities) && item.content.responsibilities.length > 0 && (
                      <div className="mt-5 space-y-4">
                        {item.content.responsibilities.map((responsibility, responsibilityIndex) => {
                          if (typeof responsibility !== "object" || responsibility === null) return null;
                          const point = responsibility as { heading?: string; detail?: string };
                          return (
                            <div key={`${point.heading ?? "responsibility"}-${responsibilityIndex}`} className="flex items-start gap-3">
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#b7e653] shadow-[0_0_10px_rgba(183,230,83,.35)]" />
                              <div className="min-w-0 flex-1">
                                {point.heading && <h4 className="text-sm font-semibold text-white/90">{point.heading}</h4>}
                                {point.detail && <p className="mt-1 text-sm leading-6 text-white/55">{point.detail}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {item.tags?.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{item.tags.map(tag => <span key={tag} className="rounded-full border border-[#b7e653]/25 bg-[#b7e653]/[0.06] px-3 py-1.5 text-xs text-white/75 transition hover:border-[#b7e653]/60 hover:text-[#d0f78b]">{tag}</span>)}</div>}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Achievements — add rows in Supabase to populate */}
      {(achievements.length > 0 || loading) && (
        <motion.section id="achievements" className="border-y border-white/[0.07] bg-white/[0.018]" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6 }}>
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
            <p className="eyebrow mb-5">04 — HIGHLIGHTS</p><h2 className="mb-12 text-4xl font-medium tracking-tight md:text-5xl">Milestones worth sharing.</h2>
            {loading ? <p className="text-sm text-white/45">Loading achievements…</p> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((item, index) => (
                  <motion.article key={item.id} className="glass-card premium-card group overflow-hidden rounded-2xl" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06 }}>
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover transition duration-700 group-hover:scale-[1.02]" style={{ objectPosition: String(item.content.imagePosition ?? "center") }} />
                    ) : <div className="flex h-32 items-center justify-center bg-[radial-gradient(ellipse_at_50%_50%,rgba(183,230,83,.13),transparent_65%)]"><span className="text-4xl text-[#b7e653]">✳</span></div>}
                    <div className="p-5"><p className="text-xs tracking-[.16em] text-[#b7e653]">{String(item.content.organization ?? item.content.category ?? "ACHIEVEMENT")}</p><h3 className="mt-2 text-lg font-medium">{item.title}</h3>{item.description && <p className="mt-2 text-sm leading-6 text-white/50">{item.description}</p>}</div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Skills — each Supabase row is a category; legacy items arrays remain supported */}
      <motion.section id="skills" className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65 }}>
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="eyebrow mb-5">05 — CAPABILITIES</p><h2 className="text-4xl font-medium tracking-tight md:text-5xl">A toolkit for solving problems.</h2></div>
          <p className="max-w-md text-sm leading-7 text-white/45">Business thinking, analytical tools and technical fluency — grouped by how I use them.</p>
        </div>
        {loading ? <p className="text-sm text-white/45">Loading skills…</p> : skills.length === 0 ? <p className="text-sm text-white/45">Add skill categories in Supabase to display them here.</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((category, index) => (
              <motion.article key={category.id} className="glass-card premium-card group relative overflow-hidden rounded-3xl p-6 sm:p-7" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06 }}>
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#b7e653]/[0.06] blur-2xl transition group-hover:bg-[#b7e653]/[0.12]" />
                <div className="relative"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b7e653]/20 bg-[#b7e653]/[0.07] text-2xl text-[#b7e653]">{category.icon === "chart" ? "⌁" : category.icon === "workflow" ? "⤢" : category.icon === "code" ? "⌘" : category.icon === "users" ? "◎" : "✳"}</div>
                  <h3 className="text-lg font-semibold tracking-tight">{category.title}</h3>
                  {category.description && <p className="mt-2 text-sm leading-6 text-white/45">{category.description}</p>}
                  <div className="mt-5 flex flex-wrap gap-2">{category.items.map((skill) => <span key={skill} className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/65 transition hover:border-[#b7e653]/35 hover:text-[#d0f78b]">{skill}</span>)}</div>
                  <div className="mt-6 h-px w-10 bg-[#b7e653]/70 transition-all group-hover:w-16" />
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.section>

      {/* Education and certifications — scalable Supabase-driven journey */}
      <motion.section
        id="journey"
        className="relative overflow-hidden border-y border-white/[0.07] bg-[#0a0c09]"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.65 }}
      >
        <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-[#80a82d]/[0.08] blur-[100px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#80a82d]/[0.05] blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="mb-14 max-w-3xl">
            <p className="eyebrow mb-5">06 — THE JOURNEY</p>
            <h2 className="text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Built on curiosity.<br />
              <span className="accent-gradient">Driven by growth.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              A foundation in technology, business management and continuous learning.
            </p>
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
            {/* Education timeline */}
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="eyebrow">EDUCATION</p>
                <span className="text-xs text-white/35">{String(education.length).padStart(2, "0")} QUALIFICATIONS</span>
              </div>
              <div className="relative space-y-4 before:absolute before:bottom-8 before:left-[25px] before:top-8 before:w-px before:bg-gradient-to-b before:from-[#b7e653]/70 before:via-[#b7e653]/25 before:to-transparent">
                {education.map((item, index) => (
                  <motion.article
                    key={item.id}
                    className="glass-card premium-card group relative overflow-hidden rounded-3xl p-5 sm:p-7"
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#b7e653]/[0.045] blur-3xl transition group-hover:bg-[#b7e653]/[0.10]" />
                    <div className="relative flex items-start gap-4 sm:gap-5">
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#b7e653]/25 bg-[#1a2113] text-[#c9f477] shadow-[0_0_24px_rgba(183,230,83,0.06)] sm:h-14 sm:w-14">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt={`${item.institution ?? "Institution"} logo`} className="h-full w-full bg-white p-1.5 object-contain" />
                        ) : <span className="text-xl">{index === 0 ? "✳" : "⌘"}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#b7e653]/20 bg-[#b7e653]/[0.06] px-2.5 py-1 text-[9px] font-semibold tracking-[0.15em] text-[#c9f477]">
                            {index === 0 ? "POSTGRADUATE" : "UNDERGRADUATE"}
                          </span>
                          {item.period && <span className="text-[11px] text-white/40">{item.period}</span>}
                        </div>
                        <h3 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">{item.qualification}</h3>
                        <p className="mt-1.5 text-sm font-medium text-[#b7e653]">{item.institution}</p>
                        {item.description && <p className="mt-3 text-sm leading-6 text-white/50">{item.description}</p>}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {item.grade && <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/70"><span className="text-[#b7e653]">◆</span> Grade · {item.grade}</span>}
                          {item.highlights?.map((highlight) => <span key={highlight} className="rounded-lg border border-[#b7e653]/20 bg-[#b7e653]/[0.045] px-3 py-2 text-xs text-white/70">{highlight}</span>)}
                        </div>
                      </div>
                      <span className="hidden text-2xl font-light text-white/[0.12] transition group-hover:text-[#b7e653]/60 sm:block">0{index + 1}</span>
                    </div>
                  </motion.article>
                ))}
                {education.length === 0 && <p className="text-sm text-white/45">Add education records in Supabase.</p>}
              </div>
            </div>

            {/* Featured certification */}
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="eyebrow">CERTIFICATIONS</p>
                <span className="text-xs text-white/35">{String(certifications.length).padStart(2, "0")} CREDENTIALS</span>
              </div>
              <div className="space-y-4">
                {certifications.map((item, index) => (
                  <motion.article
                    key={item.id}
                    className={`glass-card premium-card group relative overflow-hidden rounded-3xl ${index === 0 ? "border-[#b7e653]/30 bg-gradient-to-br from-[#1b2412] via-[#10130d] to-[#0c0e0b] p-6 sm:p-7" : "p-5 sm:p-6"}`}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.07 }}
                  >
                    {index === 0 && <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#b7e653]/[0.10] blur-3xl" />}
                    <div className="relative">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-2">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={`${item.name ?? "Certification"} certificate`}
                              className="h-44 w-full rounded-lg bg-white object-contain p-1 sm:h-52"
                            />
                          ) : (
                            <div className="flex h-28 items-center justify-center rounded-lg bg-[#1b2613] text-3xl text-[#c9f477]">
                              ✳
                            </div>
                          )}
                        </div>
                      {item.status && <span className="rounded-full border border-[#b7e653]/20 bg-[#b7e653]/10 px-3 py-1.5 text-[10px] font-semibold text-[#d0f78b]">{item.status}</span>}
                      </div>
                      <p className="mb-2 text-[9px] font-semibold tracking-[0.2em] text-[#b7e653]">FEATURED CREDENTIAL</p>
                      <h3 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">{item.name}</h3>
                      {item.provider && <p className="mt-2 text-sm text-white/55">{item.provider}</p>}
                      {item.issue_date && <p className="mt-2 text-xs text-white/35">Issued {item.issue_date}</p>}
                      {item.credential_id && <p className="mt-3 break-all text-xs text-white/35">Credential ID · {item.credential_id}</p>}
                      {(item.link || item.issue_date || item.credential_id) && (
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                          {item.issue_date && <span className="text-[10px] tracking-[0.12em] text-white/40">ISSUED {item.issue_date}</span>}
                          {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[#c9f477] transition hover:gap-3">View credential <span aria-hidden="true">↗</span></a>}
                        </div>
                      )}
                    </div>
                  </motion.article>
                ))}
                {certifications.length === 0 && <p className="text-sm text-white/45">Add certifications in Supabase.</p>}

              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section id="contact" className="relative mx-6 my-12 overflow-hidden rounded-[2rem] border border-[#b7e653]/20 bg-gradient-to-br from-[#171d10] to-[#0c0d0b] sm:mx-10 lg:mx-auto lg:my-20 lg:max-w-7xl" initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}>
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-25" />
        <div className="glow-orb absolute -right-20 -top-20 h-72 w-72" />

        <div className="relative px-7 py-20 text-center sm:px-12 sm:py-28">
          <p className="eyebrow mb-6">06 — DID I INTEREST YOU??</p>
          <h2 className="mx-auto max-w-4xl text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Have a problem
            <br />
            worth <span className="accent-gradient">solving?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-8 text-white/55">
            I&apos;m interested in meaningful problems, thoughtful products and
            opportunities to create impact.
          </p>

          <a
            href="mailto:kavinbharathi.a@gmail.com"
            className="btn-primary mt-9"
          >
            Start a conversation ↗
          </a>
          <p className="mt-4 text-xs text-white/35">Chennai, Tamil Nadu · kavinbharathi.a@gmail.com</p>
        </div>
      </motion.section>

      {/* Animated contact popup */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setContactOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title" className="glass-card relative w-full max-w-md overflow-hidden rounded-3xl border border-[#b7e653]/25 p-6 shadow-2xl sm:p-8" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.22 }} onClick={(event) => event.stopPropagation()}>
              <button type="button" aria-label="Close contact popup" onClick={() => setContactOpen(false)} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-[#b7e653]/50 hover:text-[#b7e653]">✕</button>
              <p className="eyebrow mb-3">LET&apos;S CONNECT</p><h2 id="contact-dialog-title" className="pr-8 text-3xl font-semibold tracking-tight">Get in touch<span className="text-[#b7e653]">.</span></h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Open to opportunities in Business Analysis, Product Analysis and digital products.</p>
              <div className="mt-7 space-y-3">
                <a href="tel:+918838116397" className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-[#b7e653]/40 hover:bg-[#b7e653]/[0.06]"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b7e653]/10 text-xl text-[#b7e653]">☎</span><span className="min-w-0 flex-1"><span className="block text-xs text-white/40">MOBILE</span><span className="mt-1 block text-sm font-medium text-white">+91 8838116397</span></span><span className="text-[#b7e653]">↗</span></a>
                <a href="mailto:kavinbharathi.a@gmail.com" className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-[#b7e653]/40 hover:bg-[#b7e653]/[0.06]"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b7e653]/10 text-xl text-[#b7e653]">✉</span><span className="min-w-0 flex-1"><span className="block text-xs text-white/40">EMAIL</span><span className="mt-1 block break-all text-sm font-medium text-white">kavinbharathi.a@gmail.com</span></span><span className="text-[#b7e653]">↗</span></a>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b7e653]/10 text-xl text-[#b7e653]">⌖</span><span><span className="block text-xs text-white/40">LOCATION</span><span className="mt-1 block text-sm font-medium text-white">Chennai, Tamil Nadu, India</span></span></div>
              </div>
              <a href="mailto:kavinbharathi.a@gmail.com?subject=Opportunity%20-%20Kavinbharathi%20Ananth" className="btn-primary mt-6 w-full justify-center rounded-full px-5 py-4">Send me an email <span aria-hidden="true">↗</span></a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-xs text-white/35 sm:flex-row lg:px-12">
        <span>© 2026 Kavinbharathi. Built with intention.</span>
        <a href="#" className="transition hover:text-[#b7e653]">
          Back to top ↑
        </a>
      </footer>
    </main>
  );
}
