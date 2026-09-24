import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureSteps } from './FeatureSteps';

const meta = {
  title: 'Landing/FeatureSteps',
  component: FeatureSteps,
  args: {
    steps: [
      { title: '10 סרטוני הדרכה פרקטיים', text: 'תרגילים מפורטים שניתן ליישם מיד, מהסלון שלך, ללא ציוד מיוחד.' },
      { title: '6 טיפי זהב', text: 'טיפים מעשיים שיעזרו לך ללוות את התינוק בצורה הכי נכונה.' },
      { title: 'בונוס: הכנה לשלב הזחילה', text: 'סרטון ייחודי שיבנה את התשתית המוטורית לשלב ההתפתחותי הבא.' },
      { title: 'ליווי אישי בווטסאפ', text: 'שולחת לי סרטון של התרגול, ואני מחזירה פידבק ודיוק אישי.', badge: 'הכי שווה' },
    ],
  },
} satisfies Meta<typeof FeatureSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <div style={{ maxWidth: 720 }}><FeatureSteps {...args} /></div> };
