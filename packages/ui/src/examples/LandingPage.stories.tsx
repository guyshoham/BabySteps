import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  CourseCard,
  CredentialPill,
  Divider,
  Faq,
  FeatureSteps,
  Footer,
  Hero,
  HighlightBox,
  PriceCard,
  ProblemCard,
  Section,
  SectionHeading,
  SiteNav,
  StarRating,
  StickyCTA,
  TestimonialCard,
  VideoFrame,
} from '../index';
import { storyAssets } from '../../.storybook/assets';

const grid = (min: number) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
  gap: 'var(--space-5)',
});

function LandingPage() {
  return (
    <div style={{ paddingBlockEnd: 96 }}>
      <SiteNav
        logo={{ src: storyAssets.logoPeach, alt: '' }}
        title="מתחילים בקטן"
        links={[
          { label: 'מה בקורס', href: '#content' },
          { label: 'מי אני', href: '#about' },
          { label: 'המלצות', href: '#reviews' },
        ]}
        cta={{ label: 'לרכישה', href: '#register' }}
      />
      <Hero
        tag="קורס דיגיטלי · צפייה מיידית"
        title={<>לעזור לבייבי שלך <em>להתהפך</em>, בצורה רגועה ומקצועית</>}
        subtitle="היי אהובה, כאן ירדן. בניתי עבורך קורס דיגיטלי ממוקד שייתן לך את כל הכלים לעזור לתינוק שלך לעבור את שלב ההתהפכות, בביטחון מלא."
        actions={
          <>
            <Button size="lg" icon="arrow" href="#register">רכישה וגישה מיידית</Button>
            <Button size="lg" variant="outline" href="#content">מה יש בקורס?</Button>
          </>
        }
        proof={<><StarRating value={5} size={16} /><span>200+ אמהות מרוצות</span></>}
        media={<VideoFrame poster={storyAssets.teaserPoster} caption="הצצה לקורס" />}
      />
      <Divider variant="wave" from="peach" tone="white" />
      <Section tone="white">
        <SectionHeading eyebrow="מזהה את עצמך?" title="האם זה המצב אצלכם כרגע?" />
        <div style={grid(240)}>
          <ProblemCard emoji="🙆" title="התינוק לא מתהפך כלל" text="אתם מנסים, אבל הוא עדיין לא עושה את התנועה בעצמו." />
          <ProblemCard emoji="🔄" title="מתהפך רק לפעמים" text="יש ניסיונות, אבל ההתהפכות לא קורית בצורה עקבית." />
          <ProblemCard emoji="↩️" title="מתהפך לכיוון אחד בלבד" text="מצליח לצד אחד אבל מתקשה עם הצד השני." />
        </div>
        <div style={{ marginBlockStart: 'var(--space-6)' }}>
          <HighlightBox icon="sparkle" title="אם הכרת לפחות אחד מהמצבים האלה">
            הקורס הזה נבנה בדיוק בשבילך. בצעדים קטנים, עם הידיים, מהסלון שלך.
          </HighlightBox>
        </div>
      </Section>
      <Section tone="cream" id="content" width="narrow">
        <SectionHeading eyebrow="תוכן הקורס" title={<>מה <em>מחכה לך</em> בפנים?</>} />
        <FeatureSteps
          steps={[
            { title: '10 סרטוני הדרכה פרקטיים', text: 'תרגילים מפורטים שניתן ליישם מיד, ללא ציוד מיוחד.' },
            { title: '6 טיפי זהב', text: 'טיפים מעשיים שיעזרו לך ללוות את התינוק בצורה הכי נכונה.' },
            { title: 'בונוס: הכנה לשלב הזחילה', text: 'סרטון שבונה את התשתית המוטורית לשלב הבא.' },
            { title: 'ליווי אישי בווטסאפ', text: 'שולחת לי סרטון של התרגול, ואני מחזירה פידבק אישי.', badge: 'הכי שווה' },
          ]}
        />
      </Section>
      <Section tone="mint" id="about">
        <SectionHeading eyebrow="מי אני?" title="ירדן שוהם" lead="אמא לשניים ומלווה התפתחותית מוסמכת. מגיעה מעולם החינוך, עם למעלה מ-6 שנות ניסיון." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <CredentialPill>מלווה התפתחותית מוסמכת</CredentialPill>
          <CredentialPill icon="heart">מדריכת בייבי יוגה</CredentialPill>
          <CredentialPill icon="baby">עיסוי תינוקות</CredentialPill>
        </div>
      </Section>
      <Section tone="white" id="reviews">
        <SectionHeading eyebrow="חוויות מהשטח" title="מה אומרות האמהות?" />
        <div style={grid(280)}>
          <TestimonialCard name="כרמל" quote="תוכן שכל אמא חייבת לצרוך, ברמה הכי נעימה ומקיפה. כיף לצפות ובמיוחד לתרגל." />
          <TestimonialCard name="טל" quote="תודה על כל העזרה, על הליווי הצמוד ועל התמיכה! למדתי ממך מלא." />
          <TestimonialCard name="אוריה" quote="כבר קורס שני שאני איתך, אין כמוך ❤️" />
        </div>
      </Section>
      <Section tone="peach" id="register">
        <SectionHeading eyebrow="הצטרפות לקורס" title="בחרי את הדרך הנוחה לך" />
        <div style={{ ...grid(280), maxWidth: 820, marginInline: 'auto', paddingBlockStart: 'var(--space-4)' }}>
          <PriceCard
            featured
            badge="הכי מומלץ"
            title="תשלום דרך PayPal"
            description="מקבלות מייל עם פרטי גישה, מיד אחרי התשלום."
            price="₪175"
            oldPrice="₪205"
            priceNote="תשלום חד-פעמי"
            features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ', 'גישה מיידית']}
            cta={<Button icon="arrow">שלמי וקבלי גישה מיידית</Button>}
          />
          <PriceCard
            title="העברה ידנית"
            description="ביט או Paybox, ואז הודעת אישור בווטסאפ."
            price="₪175"
            oldPrice="₪205"
            priceNote="תשלום חד-פעמי"
            features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ']}
            cta={<Button variant="whatsapp">שלחי אישור בווטסאפ</Button>}
          />
        </div>
      </Section>
      <Section tone="white" width="narrow">
        <SectionHeading title="שאלות נפוצות" />
        <Faq
          items={[
            { question: 'לאיזה גיל הקורס מתאים?', answer: 'מגיל 3 חודשים ועד שהתינוק מתהפך בביטחון לשני הצדדים.' },
            { question: 'כמה זמן יש לי גישה?', answer: 'שנה מלאה, ואפשר לצפות כמה פעמים שרוצים.' },
            { question: 'איך עובד הליווי בווטסאפ?', answer: 'שולחת לי סרטון קצר של התרגול, ואני מחזירה פידבק אישי.' },
          ]}
        />
      </Section>
      <Section tone="cream">
        <SectionHeading title="עוד קורסים" />
        <div style={grid(280)}>
          <CourseCard title="קורס התהפכות" emoji="🔄" status="זמין עכשיו" price="₪105" meta={['10 סרטונים', 'ליווי בווטסאפ']} cta={<Button size="sm" icon="arrow">לקורס</Button>} />
          <CourseCard title="קורס שכיבה על הבטן" emoji="🤱" tone="mint" status="בקרוב" comingSoon description="לעודד את התינוק ליהנות מהשכיבה על הבטן." />
        </div>
      </Section>
      <Footer
        logo={{ src: storyAssets.logoPeach, alt: 'מתחילים בקטן' }}
        title="ירדן שוהם · מתחילים בקטן"
        tagline="מלווה התפתחותית · קורסים דיגיטליים לתינוקות"
        social={[
          { label: 'WhatsApp', href: 'https://wa.me/972542366243', icon: 'whatsapp' },
          { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
        ]}
        note="© 2026 ירדן שוהם · כל הזכויות שמורות"
      />
      <StickyCTA title="קורס מתהפכים" subtitle="₪175 · גישה מיידית" action={<Button size="sm" icon="arrow" href="#register">לרכישה</Button>} />
    </div>
  );
}

const meta = {
  title: 'Examples/LandingPage',
  component: LandingPage,
  parameters: { bsFlush: true },
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RollingCourse: Story = {};
