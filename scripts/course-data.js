// scripts/course-data.js — the single source of truth for courses and lessons.
//
// Read by `seed.js` (writes these to Firestore), `prepare-videos.js` (transcodes the
// originals into correctly-named web-safe files) and `upload-videos.js` (uploads them
// to R2), so a lesson's id, order, and r2Key can never drift between the three.
//
// `kind` decides how app/lesson.html renders the asset:
//   "video" → <video> player with progress tracking
//   "image" → <img>, marked complete once it loads; `alt` (required) is its alt text
// Both are served the same way: a short-lived signed R2 URL from /api/video-url.
//
// `durationSec` is informational only — no page reads it yet.

export const DATA = {
  courses: [
    {
      id: "rolling",
      slug: "rolling",
      title: "קורס מתהפכים",
      order: 1,
      published: true,
      description:
        "כל הכלים ללוות את התינוק בשלב ההתהפכות: 10 סרטוני הדרכה, 6 טיפי זהב ובונוס הכנה לזחילה.",
      coverImage: "/assets/photos/yarden-course-cover.jpg",
    },
    {
      id: "tummy-time",
      slug: "tummy-time",
      title: "קורס שכיבה על הבטן",
      order: 2,
      published: false, // still "בקרוב" on the site; no lessons filmed yet
      description: "טכניקות עידוד לשכיבה על הבטן, חיזוק שרירי הצוואר והגב. בקרוב.",
      coverImage: "",
    },
  ],

  // courseId must match a course id above. Order drives the list on the course page.
  lessons: [
    // — 10 סרטוני הדרכה — titles taken from the source filenames
    { id: "rolling-01", courseId: "rolling", order: 1,  kind: "video", title: "התהפכויות",              r2Key: "rolling/lesson-01.mp4", durationSec: 0, description: "" },
    { id: "rolling-02", courseId: "rolling", order: 2,  kind: "video", title: "חימום, חלק א",          r2Key: "rolling/lesson-02.mp4", durationSec: 0, description: "" },
    { id: "rolling-03", courseId: "rolling", order: 3,  kind: "video", title: "חימום, חלק ב",          r2Key: "rolling/lesson-03.mp4", durationSec: 0, description: "" },
    { id: "rolling-04", courseId: "rolling", order: 4,  kind: "video", title: "אקורדיון",               r2Key: "rolling/lesson-04.mp4", durationSec: 0, description: "" },
    { id: "rolling-05", courseId: "rolling", order: 5,  kind: "video", title: "מזרונים, חלק א",        r2Key: "rolling/lesson-05.mp4", durationSec: 0, description: "" },
    { id: "rolling-06", courseId: "rolling", order: 6,  kind: "video", title: "מזרונים, חלק ב",        r2Key: "rolling/lesson-06.mp4", durationSec: 0, description: "" },
    { id: "rolling-07", courseId: "rolling", order: 7,  kind: "video", title: "מעקב מבט",               r2Key: "rolling/lesson-07.mp4", durationSec: 0, description: "" },
    { id: "rolling-08", courseId: "rolling", order: 8,  kind: "video", title: "לביאה וגורייה",          r2Key: "rolling/lesson-08.mp4", durationSec: 0, description: "" },
    { id: "rolling-09", courseId: "rolling", order: 9,  kind: "video", title: "מודעות לכפות הרגליים",   r2Key: "rolling/lesson-09.mp4", durationSec: 0, description: "" },
    { id: "rolling-10", courseId: "rolling", order: 10, kind: "video", title: "שעון",                   r2Key: "rolling/lesson-10.mp4", durationSec: 0, description: "" },

    // — 6 טיפי זהב — these are images, not videos. `alt` is the image's alt
    // text on the lesson page: what the photo shows and the tip's full text.
    {
      id: "rolling-tip-01", courseId: "rolling", order: 11, kind: "image", title: "טיפ זהב 1", r2Key: "rolling/tip-01.png", description: "",
      alt: "טיפ מתגלגלים: מרחק נגיעה. בתמונה תינוק שוכב על הצד על שמיכה בפארק, ולידו משחק טבעות צבעוני. הטקסט: כאשר נרצה לעודד את התינוק להתהפך, חשוב שנקפיד שהמשחק שאיתו אנו מעודדים את התינוק יהיה במרחק נגיעה. כלומר, לא רחוק מדי ולא קרוב מדי, כך שהוא ירגיש את המשחק בקצה האצבע. באופן הזה נעורר אצל התינוק מוטיבציה שתעודד אותו להמשיך את הפעולה.",
    },
    {
      id: "rolling-tip-02", courseId: "rolling", order: 12, kind: "image", title: "טיפ זהב 2", r2Key: "rolling/tip-02.png", description: "",
      alt: "טיפ מתגלגלים: נדנדה. בתמונה תינוק מחייך שוכב על הבטן, על שמיכה בתוך נדנדה עגולה בגינה. הטקסט: רדו לגינה הציבורית וחפשו את הנדנדה העגולה. הניחו את מזרון העגלה או שמיכת פעילות על הנדנדה, והניחו את התינוק על הבטן. באופן הזה התינוק יחווה חוויות של שיווי משקל, שחשובות לשלב זה.",
    },
    {
      id: "rolling-tip-03", courseId: "rolling", order: 13, kind: "image", title: "טיפ זהב 3", r2Key: "rolling/tip-03.png", description: "",
      alt: "טיפ מתגלגלים: אלכסון. בתמונה תינוק שוכב על הגב על מחצלת ומושיט ידיים אל ספר בד צבעוני שמונח מעל ראשו. הטקסט: לאחר שהצגתן את החפץ בקו האמצע והתינוק שלח את ידיו לאחוז, הובילו את מבטו של התינוק אחרי החפץ אל הצד. הניחו את המשחק מאחורי הכתף שאליה תרצו שיתהפך, באלכסון לראש.",
    },
    {
      id: "rolling-tip-04", courseId: "rolling", order: 14, kind: "image", title: "טיפ זהב 4", r2Key: "rolling/tip-04.png", description: "",
      alt: "טיפ מתגלגלים: זמן צדדים. בתמונה תינוק שוכב על הצד באמבטיה של עגלה ומחזיק ספרון שעומד לידו. הטקסט: שהייה על הצדדים היא אחת מאבני היסוד שהתינוק צריך כדי להתפתח באופן מאורגן בכל שלבי ההתפתחות. נצלו את האמבטיה של העגלה לזמן צדדים, הציגו ספרון או משחק, ואל תשכחו את שני צידי הגוף.",
    },
    {
      id: "rolling-tip-05", courseId: "rolling", order: 15, kind: "image", title: "טיפ זהב 5", r2Key: "rolling/tip-05.png", description: "",
      alt: "טיפ מתגלגלים: אווירון. בתמונה תינוק שוכב על הבטן על מזרן, מרים את הראש ופורש את הידיים לצדדים כמו כנפיים. הטקסט: כאשר התינוק מרים את רגליו בשכיבה על הגב, נראה אותו מתרומם למנח אווירון בשכיבה על הבטן. מנח זה תקין והוא חלק מההתפתחות. חשוב לראות שהתינוק יודע לרדת מהגובה ולחזור לשכיבה מאורגנת על הבטן. הציגו לתינוק משחק בקו האמצע. אם זה לא מספיק, געו עם המשחק בכפות הידיים וחזרו לקו האמצע, ולאחר מכן העניקו מגע עמוק לרגליים.",
    },
    {
      id: "rolling-tip-06", courseId: "rolling", order: 16, kind: "image", title: "טיפ זהב 6", r2Key: "rolling/tip-06.png", description: "",
      alt: "טיפ מתגלגלים: כפות רגליים. בתמונה רגליו של תינוק במכנס פסים, עם כפות רגליים יחפות, על שטיח. הטקסט: אחד התנאים להתהפכות הוא שימוש בכפות הרגליים. תינוק נולד כשהוא אינו מודע לאיבריו. איבר שמכוסה בבגד מוריד את המודעות של המוח לאיבר ומקשה על התינוק להשתמש בו. לכן ההמלצה היא: בקיץ, בלי מכנס בכלל. בחורף, להלביש את התינוק במכנס בלי רגליות, עם גרביים, ולהוריד את הגרביים לפרקי זמן כשהבית מחומם.",
    },

    // — בונוסים, בסוף הקורס —
    {
      id: "rolling-bonus-crawling", courseId: "rolling", order: 17, kind: "video",
      title: "בונוס: הכנה לשלב הזחילה",
      r2Key: "rolling/bonus-crawling.mp4", durationSec: 0,
      description: "סרטון ייחודי שבונה את התשתית המוטורית לשלב ההתפתחותי הבא.",
    },
    {
      id: "rolling-appendix", courseId: "rolling", order: 18, kind: "video",
      title: "נספח",
      r2Key: "rolling/appendix.mp4", durationSec: 0,
      description: "",
      // No leading number in the source filename, so pin it explicitly.
      sourceName: "נספח.mp4",
    },

    // tummy-time lessons go here once the course is filmed (set published: true above).
  ],
};

// --- validation: a bad courseId or duplicate id silently breaks a page ---
export function validate({ courses, lessons }) {
  const errors = [];
  const courseIds = new Set();
  const slugs = new Set();
  for (const c of courses) {
    if (courseIds.has(c.id)) errors.push(`duplicate course id: ${c.id}`);
    if (slugs.has(c.slug)) errors.push(`duplicate course slug: ${c.slug}`);
    courseIds.add(c.id);
    slugs.add(c.slug);
  }
  const lessonIds = new Set();
  const keys = new Set();
  const orderPerCourse = new Map();
  // The video scripts match local files by the last part of the key, so two keys
  // in one course must not end in the same file name.
  const basenamePerCourse = new Map();
  for (const l of lessons) {
    if (lessonIds.has(l.id)) errors.push(`duplicate lesson id: ${l.id}`);
    lessonIds.add(l.id);
    if (!courseIds.has(l.courseId)) errors.push(`lesson ${l.id}: unknown courseId "${l.courseId}"`);
    if (!l.r2Key) errors.push(`lesson ${l.id}: empty r2Key`);
    if (keys.has(l.r2Key)) errors.push(`lesson ${l.id}: r2Key "${l.r2Key}" is used by another lesson`);
    keys.add(l.r2Key);
    if (l.r2Key) {
      const names = basenamePerCourse.get(l.courseId) ?? new Map();
      const name = l.r2Key.split("/").pop();
      const other = names.get(name);
      if (other && other !== l.r2Key) {
        errors.push(`lesson ${l.id}: r2Key "${l.r2Key}" has the same file name as "${other}" in ${l.courseId}`);
      }
      if (!other) names.set(name, l.r2Key);
      basenamePerCourse.set(l.courseId, names);
    }
    if (l.kind !== "video" && l.kind !== "image") errors.push(`lesson ${l.id}: kind must be "video" or "image"`);
    // An image is read only through its alt text, so every image needs one.
    if (l.kind === "image" && !(typeof l.alt === "string" && l.alt.trim())) errors.push(`lesson ${l.id}: image needs alt text`);
    const seen = orderPerCourse.get(l.courseId) ?? new Set();
    if (seen.has(l.order)) errors.push(`lesson ${l.id}: order ${l.order} already used in ${l.courseId}`);
    seen.add(l.order);
    orderPerCourse.set(l.courseId, seen);
  }
  return errors;
}
