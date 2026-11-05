# تحديث توقعاتي: الحساب المالي + التوثيق + النجمة + الأوديس

حزمة جاهزة تُنسخ داخل تطبيقك. قاعدة البيانات (predictions-app) **محدَّثة ومُختبرة بالفعل**، وهذه الحزمة هي جانب التطبيق.

```
src/finance/            <- انسخ هذا المجلد كاملاً إلى src/ في تطبيقك
  supabaseClient.js     <- سطر واحد تعدّله: مسار عميل Supabase عندك
  api.js  store.js  theme.js  strings.js  format.js
  usePredictionGate.js
  components/  FinanceBox  FinanceSheet  TopupForm  BadgePicker
               PointsHistory  WalletHistory  StarBadge  OddsBadge  Btn
supabase/
  001_wallet_verification_odds.sql   <- نسخة مما نُفّذ (للأرشيف أو لمشروع آخر)
  admin_commands.sql                 <- أوامر الإدارة (الأود، الأكواد)
  checks.sql                         <- فحوصات سلامة (كلها يجب أن ترجع صفر صفوف)
```

لا حاجة لحزم جديدة: يستخدم `react-native` و`zustand` و`@expo/vector-icons` (موجودة عندك أصلاً حسب بنية القالب).

## 1) الربط الأول
افتح `src/finance/supabaseClient.js` وغيّر المسار إلى ملف Supabase الذي يستخدمه تطبيقك، إذا اختلف عن `../lib/supabase`.
`theme.js` فيه الألوان والعملة (`CURRENCY`)، عدّلها لتطابق تصميمك.

## 2) البوكس الرابع في الشاشة الرئيسية
بجانب بوكسات المسابقة والصدارة والمنافسة:

```jsx
import { FinanceBox } from '../finance';

// user.id = رقم المستخدم من prediction_users (نفس الرقم الذي يستخدمه تطبيقك الآن)
<FinanceBox userId={user.id} style={{ flex: 1 }} />
```
مرّر `style` ليطابق حجم وهوامش البوكسات الأخرى. البوكس مربّع (`aspectRatio: 1`)، يعرض الرصيد، وبالضغط عليه تنبثق النافذة: الرصيد والتوثيق، تبويب "سجل النقاط" (كل مباراة مع الأود والمجموع التراكمي)، تبويب "سجل الرصيد"، زر "تعبئة"، وزر "اختر نجمتك".

## 3) منع حفظ التوقع قبل التوثيق
في شاشة المباراة حيث يُحفظ التوقع:

```jsx
import { usePredictionGate } from '../finance';

const { guard, handleSaveError, gateElement } = usePredictionGate(user.id);

const save = async () => {
  const { error } = await supabase.from('predictions').upsert(/* ...كودك الحالي... */);
  if (error && handleSaveError(error)) return;   // السيرفر رفض: not_verified -> تظهر واجهة التوثيق
  // ...باقي معالجتك الحالية...
};

<Button onPress={() => guard(save)} />   // فحص مسبق قبل الحفظ
{gateElement}                            // ضعه مرة واحدة في الشاشة
```
- يتصفح المستخدم المباريات عادي، وعند الضغط على حفظ تظهر واجهة "وثّق الآن".
- "وثّق الآن" يفتح الكود السري (12 رقماً) وفراغ الإحالة وزر "إدخال".
- بعد النجاح يختار النجمة (🔴🟢🟡) ثم يكمل حفظ التوقع تلقائياً.
- السيرفر يرفض الحفظ فعلياً (`not_verified`) حتى لو تجاوز أحدهم واجهة التطبيق.

## 4) عرض الأود قبل التثبيت
```jsx
import { OddsBadge, ExpectedPoints } from '../finance';

<OddsBadge odds={match.odds} />        // في بطاقة المباراة: ×1.35
<ExpectedPoints odds={match.odds} />   // في خطوة التأكيد: النقاط المتوقعة لكل حالة
```
تأكد أن استعلام المباريات يجلب العمود `odds` (إن كنت تستخدم `select('*')` فهو موجود تلقائياً).
الأود في التطبيق للعرض فقط. السيرفر يثبّته من جدول `matches` لحظة الحفظ.

## 5) النجمة بجانب الاسم (الصدارة والمنافسات)
```jsx
import { NameWithBadge, useFinanceStore } from '../finance';

const badges = useFinanceStore((s) => s.badges);
const loadBadges = useFinanceStore((s) => s.loadBadges);
useEffect(() => { loadBadges(); }, []);

<NameWithBadge name={row.display_name} badge={badges[row.id]} textStyle={styles.name} />
```
افعل الشيء نفسه في شاشة المنافسات (friend challenges).

## 6) تسجيل الخروج
عند خروج المستخدم استدعِ `useFinanceStore.getState().reset()` حتى لا يظهر رصيد المستخدم السابق.

## 7) الإدارة (من SQL Editor)
راجع `supabase/admin_commands.sql`:
- تحديد الأود: `update public.matches set odds = 1.35 where id = 22;` (القاعدة ترفض أي قيمة خارج 1.00-2.00).
- إنشاء أكواد: `select * from public.generate_topup_codes(10000, 50);`
- لا توجد لوحة إدارة داخل التطبيق: الأود والأكواد تُدار من القاعدة كما طلبت.

## كيف يعمل (مختصر)
- الكود 12 رقماً في جدول سري، يُستخدم مرة واحدة، و5 محاولات خاطئة كل 15 دقيقة. استخدامه يضيف المبلغ ويوثّق الحساب ويحفظ الإحالة.
- النقاط = (25 / 5 / 1) × الأود المثبّت لحظة التوقع، مقرّبة لأقرب عدد صحيح.
- الحسابات الموجودة قبل التحديث معفاة من الحاجز. الحسابات الجديدة فقط تحتاج توثيقاً.
