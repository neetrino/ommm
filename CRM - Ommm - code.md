# 📱 Mobile APP

# **Ommm.**

# **TECHNICAL SPECIFICATIONS**

## **Ընդհանուր նկարագրություն (Overview)**

Ommm. Mobile Application-ի նպատակն է ստեղծել հարմարավետ, calm և personal digital experience, որտեղ user-ը կարող է արագ կատարել booking, տեսնել իր upcoming classes-ը, կառավարել membership-ը, հետևել իր progress-ին և ներգրավվել Ommm. community-ում։

* դիտել classes  
* ընտրել schedule  
* կատարել booking  
* կառավարել membership  
* ներգրավվել community-ում

## **Application-ի հիմնական բաժինները**

Application-ը կունենա հետևյալ հիմնական tabs-ը՝

1. **Home**  
* Upcomings  
* Waitlist  
* Explore (Events / blog / news / updates)  
2. **Classes \> scvehdule**  
* Calendar and  schedule  
* Coaches’ details  
3. **My Bookings**  
4. **My account**  
* Progress / achievements   
* Memberships & Billing  
* Gift Cards  
* Settings (personal details)

# **1\) Home**

Home page-ը user-ի հիմնական dashboard-ն է։ Այստեղ user-ը պետք է մեկ տեղում տեսնի իր կարևոր տեղեկությունները և արագ անցնի հիմնական գործողություններին։

## **Home page-ը պետք է ներառի**

### **1.1 Header**

* Menu icon  
* **Make a booking** CTA button

### **1.2 User Greeting Block**

Պետք է ցուցադրվի՝

* User avatar  
* Greeting text, օրինակ՝ **Hi, Anna**  
* Եթե user-ը login չի եղել, պետք է ցուցադրվի login/register CTA։

### **1.3 Upcoming Bookings**

Պետք է ցուցադրվեն user-ի առաջիկա bookings-ը։

Booking card-ը պետք է ներառի՝

* Class name  
* Date  
* Time  
* Coach name (details)  
* Booking status

Եթե booking չկա, պետք է լինի empty state՝  
**You have no bookings**

### **1.4 Waitlist**

Պետք է ցուցադրվեն user-ի active waitlists-ը։

Waitlist card-ը պետք է ներառի՝

* Class name  
* Date  
* Time  
* Position կամ status  
* Notification status

Եթե waitlist չկա՝  
**You have no waitlists**

### **1.5 Explore Preview**

Home-ում պետք է լինի Explore preview block, որտեղ կցուցադրվեն վերջին կամ կարևոր նյութերը։

Explore preview-ը կարող է ներառել՝

* Events  
* Blog  
* News  
* Updates

Յուրաքանչյուր card պետք է ունենա՝

* Image  
* Title  
* Short description կամ category  
* **Read more** CTA

### **1.6 Gift Card Banner**

Home-ում պետք է լինի gift card banner՝ որպես promo section։

Պետք է ներառի՝

* Banner image  
* Short text  
* **Buy a gift card** CTA

# 

# **2\) Classes**

Classes page-ի նպատակն է user-ին տալ հնարավորություն հեշտությամբ գտնել համապատասխան class-ը և կատարել booking։

## **Classes page-ը պետք է ներառի**

### **2.1 Header**

* Back button  
* Page title — **Classes**  
* Search icon

### **2.2 Filters**

Պետք է լինեն հիմնական filters՝

* Class type / categories  
* Coaches  
* Time slots  
* Availability status

Filters-ը կարող են բացվել dropdown կամ filter modal ձևով։

### **2.3 Calendar and Schedule**

Պետք է լինի calendar section, որտեղ user-ը կարող է ընտրել՝

* Month  
* Date  
* Week day

### **2.4 Class Card**

Յուրաքանչյուր class card պետք է ներառի՝

* Class title  
* Time  
* Duration  
* Coach avatar, name (personal details by clicking)  
* Availability status  
* **Book** button

Եթե class-ը full է, **Book** button-ի փոխարեն պետք է ցուցադրվի **Join waitlist** կամ disabled state։

### **2.5 Class Detail Page or coach detail page**

card-ի վրա սեղմելուց user-ը պետք է անցնի detail page, որը պետք է ներառի՝

* Class name  
* Description  
* Teacher name, photo, details (Short bio)  
* Date and time  
* Duration  
* Level  
* **Book** CTA

## **Class capacity indicator**

* 2 spots left  
* almost full

# 

# **3\) My Bookings**

My Bookings page-ը user-ի booking management բաժինն է, որտեղ user-ը կարող է տեսնել և կառավարել իր bookings-ը, բայց այն պետք է լինի ոչ միայն booking list, այլ նաև **User-ի ամբողջ activity-ի կենտրոն,** որտեղ user-ը կարող է՝

* տեսնել upcoming bookings  
* կառավարել current bookings  
* դիտել past bookings  
* հետևել իր activity-ին (analytics)

## **My Bookings page-ը պետք է ներառի**

### **3.1 Main Tabs**

* Bookings  
* Waitlists

### **3.2 Booking Card**

Booking card-ը պետք է ներառի՝

* Class կամ service name  
* Date and Time  
* Teacher / Specialist name, bio  
* Status  
* **Cancel booking** option  
  User-ը պետք է կարողանա cancel անել booking-ը՝ ըստ cancellation policy-ի։  
  Cancel-ից առաջ պետք է բացվի confirmation modal։

## **3.3 Past Bookings**

User-ը պետք է տեսնի իր նախկին այցելությունները։

### **Card-ը պետք է պարունակի՝**

* Class name  
* Date and Time  
* Teacher  
* Status (Completed / Missed / Cancelled)

### **Functional**

User-ը կարող է՝

* բացել booking detail  
* կրկին book անել (Rebook CTA)

* ### **Rebook shortcut \- Book again** button

## **3.4 Waitlists**

* Active waitlists  
* Status (position կամ notified)  
* Remove from waitlist

# **3.5 Activity Summary**

 Նպատակն է User-ին տալ պարզ, motivational analytics

## **Ցուցադրվող տվյալներ**

* Total classes այս ամիս  
* Favorite class type

System-ը կարող է առաջարկել՝

* “You usually train on Monday at 6PM”  
* “Your favorite class is Reformer”

# 

# **4\) My Account**

My Account բաժինը user-ի personal profile և account management կենտրոնն է, որը պետք է ներառի

### 

### **4.1 Progress / Achievements**

Progress / Achievements բաժինը նախատեսված է user-ի activity-ի, զարգացման և ներգրավվածության ցուցադրման համար։

Այս բաժինը պետք է հանդիսանա user-ի **անձնական analytics dashboard**, որտեղ նա կարող է հետևել իր մասնակցությանը, արդյունքներին և ձեռքբերումներին։

Բաժինը պետք է ոչ միայն տեղեկատվական լինի, այլ նաև ստեղծի motivation և encourage անի user-ին շարունակել իր ակտիվությունը։

## **Էջի կառուցվածք**

Progress էջը պետք է ներառի հետևյալ հիմնական հատվածները՝

1. **Activity Summary (Analytics)**  
2. **Performance Metrics**  
3. **Achievements**

## **1️⃣ Activity Summary (Analytics)**

User-ը պետք է կարողանա ընտրել ժամանակահատված՝

* This month  
* This year  
* All time

User-ին պետք է ցուցադրվեն հետևյալ հիմնական metrics-ը՝

* Total classes (selected period)  
* Total hours spent (օրինակ՝ Pilates hours)  
* Total sessions completed  
* Active days (քանի օր է մասնակցել)

## 

## **2️⃣ Performance Metrics**

Պետք է ցուցադրվեն՝

* Most visited class type  
* Favorite instructor  
* Most active day of the week  
* Preferred time (morning / evening)

## **3️⃣ Achievements**

## **Structure**

Achievements-ը պետք է ներկայացվեն որպես visual badges կամ cards։ Յուրաքանչյուր achievement պետք է ունենա՝

* Title  
* Short description  
* Unlock condition  
* Status (locked / unlocked)

## **Achievement Types (օրինակներ)**

* First Class Completed  
* 5 Classes Completed  
* 10 Classes Completed  
* 50 Classes Completed  
* 100 Classes Completed

## **Advanced**

* Progress bar դեպի հաջորդ achievement  
* “You’re 2 classes away from your next achievement”

## 

## **4.2 Memberships & Billing**

Այս բաժնում user-ը պետք է կարողանա կառավարել իր membership-ը։

Պետք է ներառի՝

* Current membership plan  
* Sessions remaining  
* Renewal date  
* Billing history  
* Payment method  
* Upgrade / downgrade option  
* Pause membership option  
* Cancel membership option

## 

## **4.3 Gift Cards**

Gift Cards բաժնում user-ը պետք է կարողանա՝

* գնել gift card  
* տեսնել իր active gift cards-ը  
* ուղարկել gift card ուրիշ user-ի  
* redeem անել gift card

Gift Card purchase flow-ը պետք է ներառի՝

* Recipient name  
* Recipient email / phone  
* Message  
* Payment  
* Confirmation

## 

## **4.4 Settings**

Settings բաժինը պետք է ներառի՝

### **Personal Details**

* Name  
* Phone number  
* Email  
* Date of birth  
* Profile photo

### 

### **Notifications**

User-ը պետք է կարողանա կառավարել՝

* Booking reminders  
* Waitlist notifications  
* Promotions  
* Community updates

### **Security**

* Change password  
* Logout  
* Delete account request

# **5\) Booking Flow**

Booking Flow-ն նկարագրում է այն քայլերը, որոնց միջոցով user-ը կատարում է class booking։

Flow-ն պետք է լինի պարզ, արագ և իրականացվի նվազագույն քայլերով (max 3–4 actions)։

## **Booking Steps**

### **1\. Class Selection**

User-ը մտնում է **Classes page** և՝

* ընտրում է date (calendar-ից)  
* դիտում է available classes  
* ընտրում է class-ը

👉 սեղմում է **Book**

### **2\. Class Detail Review**

User-ը անցնում է **Class Detail page**, որտեղ տեսնում է՝

* Class name  
* Description  
* Coach details  
* Date & time  
* Duration

👉 սեղմում է **Continue / Book**

### **3\. Booking Confirmation**

User-ին ցուցադրվում է booking summary՝

* Class  
* Date & time  
* Coach  
* Duration  
* Price / session usage

👉 Եթե user-ը ունի ակտիվ membership կամ sessions \- անցնում է Step 5 (success state)

👉 Եթե չունի \- անցնում է Payment

### **4\. Payment (Conditional)**

Եթե booking-ը պահանջում է վճարում՝

User-ը պետք է՝

* ընտրի payment method  
* տեսնի price breakdown  
* հաստատի payment

Supported methods: Card

### **5\. Success State**

Booking-ի ավարտից հետո user-ը տեսնում է՝

* Success message  
* Booking details

CTA-ներ՝

* **View My Bookings**  
* **Book another class**

### **6\. System Actions**

Booking-ից հետո ավտոմատ՝

* ավելացվում է **My Bookings → Upcoming**  
* ուղարկվում է **confirmation notification**  
* ավելացվում է reminder (notification)

### **User Not Logged In \-** booking փորձի ժամանակ → redirect to **Login / Sign up**

### 

### **Cancellation Policy**

* User-ը կարող է cancel անել booking-ը 24 ժամ առաջ  
* Հակառակ դեպքում → disabled state կամ warning

# **6\) Membership Logic (Money System)**

Membership system-ը կառավարում է user-ի մուտքը classes-ին և հանդիսանում է հիմնական monetization մեխանիզմը։

## **Membership Types**

### **1\. Subscription Plans**

Օրինակ՝

* Monthly (X classes per month)  
* Unlimited monthly  
* Fixed sessions pack (10 / 20 classes)

### 

### **2\. Drop-in (One-time booking)**

User-ը կարող է book անել class առանց membership-ի՝ վճարելով մեկ դասի համար։

## 

## **3\. Membership Features**

### **Active Plan**

User-ը պետք է տեսնի՝

* Plan type  
* Sessions remaining  
* Renewal date

### **Session Usage**

* Յուրաքանչյուր booking → նվազեցնում է session count  
* Եթե sessions \= 0 → booking-ը պահանջում է payment

### **Renewal**

* Manual renewal option

### **Upgrade / Downgrade**

User-ը կարող է՝

* փոխել plan  
* upgrade անել (օրինակ՝ unlimited)

### **Pause Option**

User-ը կարող է pause անել membership-ը (օրինակ՝ travel / maternity)

# 

# **7\) Notifications System**

Notifications system-ը ապահովում է user-ի վերադարձը, հիշեցումները և ընդհանուր engagement-ը։

## **Notification Types**

### **1\. Transactional**

* Booking confirmation  
* Cancellation confirmation  
* Payment receipt

### **2\. Reminder Notifications**

* Class reminder (օրինակ՝ 2 ժամ առաջ)  
* “Your class starts soon”

### **3\. Waitlist Notifications**

* Spot available  
* “A spot opened — book now”

### **4\. Re-engagement**

Եթե user-ը inactive է \- “We miss you. Ready for your next session?”

### **5\. Community / Updates**

* New events  
* New classes  
* New coach

## **Notification Channels**

* Push notifications (primary)  
* Email (optional)

# **8\) Core System Logic**

Համակարգի հիմնական աշխատանքը հիմնված է երեք կարևոր ենթահամակարգերի վրա՝ Authentication, Payment և Waitlist management, որոնք ապահովում են user-ի մուտքը, booking-ի իրականացումը և տեղերի բաշխումը։

## **Authentication System**

Authentication համակարգը ապահովում է user-ի գրանցումը, մուտքը և account-ի անվտանգ կառավարումը։

User-ը պետք է կարողանա՝

* գրանցվել (email կամ phone միջոցով)  
* մուտք գործել իր account  
* վերականգնել password-ը  
* անցնել verification (OTP կամ email confirmation)

Համակարգը պետք է ապահովի user session-ի պահպանումը և անվտանգ տվյալների կառավարումը։

## **Payment System**

Payment համակարգը կառավարում է բոլոր վճարումները՝ membership-ների և one-time booking-ների համար։

User-ը պետք է կարողանա՝

* կատարել payment (card / local payment)  
* տեսնել price breakdown  
* ստանալ confirmation

Համակարգը պետք է նաև ապահովի՝

* failed payment handling  
* payment retry հնարավորություն  
* payment history և receipt պահպանում

Payment logic-ը պետք է կապված լինի membership system-ի հետ (sessions / subscription usage)։

## **Waitlist Logic**

Waitlist համակարգը աշխատում է այն դեպքերում, երբ class-ը ամբողջությամբ զբաղված է։

User-ը կարող է միանալ waitlist-ին և ազատ տեղ բացվելու դեպքում ստանալ notification։

Համակարգը պետք է ապահովի՝

* ավտոմատ տեղափոխում waitlist-ից booking (կամ offer system)  
* սահմանված ժամանակ user-ի համար՝ տեղը հաստատելու համար  
* expired request-ների կառավարում  
* waitlist priority (position-based)

## 

## 

## **9\) APPLICATION LANGUAGES**

Ընդհանուր application-ը պետք լինի եռալեզու

* Armenian (առաջնային)  
* Russian  
* English

# 💻 Website

# **Ommm Website**

# **Functional Requirements**

## **Ընդհանուր նկարագրություն**

Ommm. Website-ի նպատակն է ներկայացնել studio-ն, brand-ը, services/classes-ը և user-ին արագ հասցնել հիմնական action-ներին՝ booking, membership purchase կամ contact։

Website-ը պետք է ունենա նույն core functionality-ն, ինչ mobile app-ը, բայց ավելի ներկայացուցչական կառուցվածքով։

## **Website-ի հիմնական բաժինները**

1. Home  
2. Story (about us)  
3. Schedule  
4. Coaches  
5. Memberships  
6. Explore \- events, news  
7. My Account  
8. Contact Us

# 

# **1\) Home**

Home page-ը website-ի հիմնական ներկայացուցչական էջն է, որը պետք է փոխանցի Ommm. brand-ի արժեքը, ստեղծի վստահություն և user-ին տանի դեպի booking կամ membership։

## **Պետք է ներառի՝**

### **Hero Section**

* Brand visual / video  
* Main headline  
* Short brand message  
* Primary CTA — **Make a booking**  
* Secondary CTA — **View memberships**

### **About / Brand Philosophy**

* Short description about Ommm.  
* “Ommm. moment” concept  
* Studio-ի արժեքները

### **Classes Preview**

* Popular classes  
* Class cards  
* CTA — **View schedule**

### **Coaches Preview**

* Featured coaches  
* Coach photo  
* Name  
* Specialization  
* CTA — **Meet our coaches**

### **Membership CTA**

* Membership plans preview  
* Presale / promo block, եթե կա  
* CTA — **Join now**

### 

### **Explore Preview**

* Events  
* Blog  
* News  
* Updates

# 

# **2\) Story \- about us**

Story էջը ներկայացնում է Ommm. brand-ի ստեղծման պատմությունը, գաղափարը և փիլիսոփայությունը։ Այն ներառում է founder-ի պատմությունը, brand-ի հիմնական արժեքները և այն մոտեցումը, որով studio-ն կառուցում է իր փորձառությունը։

Էջում պետք է նաև ներկայացված լինի studio-ի մթնոլորտը, միջավայրը և առաջարկվող classes-ը՝ visuals-ի և կարճ նկարագրությունների միջոցով, որպեսզի user-ը կարողանա պատկերացնել ամբողջ experience-ը։

Story էջի վերջում պետք է լինեն հստակ գործողությունների կոչեր (CTA), օրինակ՝ **Book a class** կամ **Join membership**, որպեսզի user-ը հեշտությամբ անցնի հաջորդ քայլին։

# **3\) Coaches**

Coaches page-ը պետք է ներկայացնի studio-ի instructors-ին և օգնի user-ին ընտրել համապատասխան coach։

## **Պետք է ներառի՝**

* Coaches list  
* Coach photo  
* Name  
* Specialization  
* Short bio

Become a member button \> Form w/ popup

# **4\) Memberships**

Memberships page-ը website-ի հիմնական sales page-երից մեկն է։

## **Պետք է ներառի՝**

* Membership plans  
* Price  
* Sessions included  
* Benefits  
* Comparison table  
* FAQ  
* Buy / Join CTA

User-ը պետք է կարողանա՝

* ընտրել plan  
* կատարել payment  
* տեսնել confirmation  
* անցնել My Account

# **5\) Explore**

Explore բաժինը նախատեսված է community-ի և content-ի համար։

## **Պետք է ներառի՝**

* Events  
* Blog  
* News  
* Updates  
* Knowledge articles

## **Functional**

User-ը կարող է՝

* կարդալ article  
* դիտել event detail  
* share անել content

# **6\) My Account**

Նույնն է ինչ որ Application-ինը:  
Տես User Account tab-ը\>\>\>

# 

# **7\) Contact Us**

Contact Us page-ը պետք է user-ին տա արագ կապ հաստատելու հնարավորություն studio-ի հետ։

## **Պետք է ներառի՝**

* Contact form  
* Phone number  
* WhatsApp link  
* Email  
* Address  
* Google Maps embed  
* Working hours  
* Social media links

## **Contact Form fields**

* Name\*  
* Phone\*  
* Subject  
* Message\*

# 

# 

# **Website Core Functionalities**

Website-ը պետք է ապահովի՝

* User registration / login  
* Class booking  
* Waitlist  
* Membership purchase  
* Gift card purchase  
* Payment  
* User account management  
* Content browsing  
* Contact form submission  
* Multilingual support

# Admin pannel

# **Admin Pannel**

# Functional Requirements

**Admin Panel-ի բաժիններ**

Admin Panel-ը հանդիսանում է հարթակի կառավարման համակարգը և ունի հետևյալ հիմնական բաժինները՝

1. Dashboard  
2. Bookings  
3. Waitlists  
4. Clients  
5. Coaches  
6. Schedule  
7. Packages  
8. Gift Cards  
9. Finance  
10. Analytics  
11. Notification management  
12. Settings  
    Feedback  
    Guest users

# 

# 

1. # **Dashboard**

Dashboard-ը պետք է admin-ին տա արագ overview studio-ի վիճակի մասին և պետք է ցուցադրի հետևյալ տվյալները՝

* Today’s classes  
* Today’s bookings count  
* Active members count  
* Waitlist count  
* Revenue summary  
* Upcoming cancellations  
* New users  
* Important alerts

Օրինակ՝

* 8 classes today  
* 42 bookings today  
* 6 active waitlists  
* 120 active members

2. # **Bookings**

Admin-ը պետք է կարողանա տեսնել և կառավարել բոլոր bookings/appointment-ը, որոնք գալու են և վեբկայքից և մոբայլ հավելվածից։ Ցանկացած user, երբ գրանցվի որևէ դասի՝ schedule լիստից, կլինի դա մեկանգամյա, թե այլ փաթեթից, այստեղ կցուսադրվի

**2.1.** Այս էջը Պետք է ունենա ՝

* All bookings list, որտեղ ցուցակով կցուցդրվի և ավտոմատ կլցվի բոլոր տեղերից եղած գրացնումները

**2.2.** Լիստը պետք է ունենա հետևյալ դաշտերը՝

* User name and phone number (user name should be clickable, and after clicking it should open user’s data and information, the opening can be with right slide sheet)  
* Class type  
* User’s session count  
* Payment status (Paid / cash / Unpaid / Refunded)  
* Attendance status (Attended / not addtemded / No-show / Late cancel)  
*   
* Actions (delete, edit)  
* Register date  
* Channel (Website / App)

**2.3.** Այս էջը Պետք է ունենա հետևյալ ֆիլտրները՝

* Filter by date  
* Filter by class type (package type)  
* Filter by client  
* Filter by coach  
* Filter by status

**2.4.** Admin-ը կարող է լիստից եղած ցանկացած ամրագրմանը (booking) տալ հետևյալ action-ները, սրանք կարող են լիստի վերջում մի սյունյակով լինեն icon-ների տեսքով՝

* View booking  
* Cancel booking  
* Move user to another class  
* Mark as attended  
* Add internal note

## **2.5.** Booking statuses-ները հետևյալն են լինելու

* Booked  
* Completed  
* Cancelled  
* Waitlisted

**2.6.** Այս էջը պետք է տեսնել մի քանի view-ով 

* Monthly view (calendar-ի տեսքով)  
* Weekly view  
* Daily view

# 

3. # **Waitlist Management**

Admin-ը պետք է կարողանա վերահսկել waitlist-ը, որը կապված է booking-ների հետ, երբ որևէ դաս, արդեն ունենում է իր ամբողջական մասնակիցների քանկաը, բայց որևէ user ցանկանում է, waitlist-ում հայտվել, քանի որ հնարավոր է որևէ user կհանի իր booking-ը և տեղ կազատվի, էս դեպքում notification ա գնալու user-ին, որ արդեն ազատ տեղ կա, ու user-ը ունենալու ա հնարավորություն book լինելու։

**3.1.** Այս էջը պետք է ներառի ցուցակ, որտեղ լիստի տեսքով կերևան բոլոր  waitlist user-ները, ցուցակը կունենա հետևյալ սյունյակները՝

* Waitlisted user name and phone (user name should be clickable, and after clicking it should open user’s data and information, the opening can be with right slide sheet)  
* Class type name  
* Class waitlist count (քանի հոգի ա սպասում տվյալ class-ին)  
* Waitlist date

**3.2.** Admin-ը կարող է պետք է տվյալ սյունյակի վերջում ունենա actions սյունյակ, որը կունենա կառավարման գործողություններ՝ icon-ի տեսքով՝

4. Move user from waitlist to booking  
5. Remove user from waitlist  
6. Notify user manually

# **4\. Client/user Management**

Admin-ը պետք է կարողանա տեսնել user profiles-ը և դրանց activity-ն։

**4.1.** Client-ի էջը պետք է ունենա ցուցակ, որտեղ ցուցադրվելու են բոլոր user-ները, իսկ լիստը պետք է ներառի՝

* photo  
* Name and Phone (user name should be clickable, and after clicking it should open user’s data and information, the opening can be with right slide sheet \- the data should be: Booking history, Payment history, Gift cards, client activity and progress and all lifetime history, Total visits, Lifetime value)  
* Date of birth  
* Sessions remaining (ex. 8/3)  
* Register date  
* Notes  
* Actions (delete, edit, deactivate, badge (see 4.3 point))

**4.2.** Admin-ը կարող է՝

* Edit client info  
* View activity  
* Add note  
* Pause membership  
* Cancel membership  
* Assign package manually  
* Give gift cards

**4.3.** Ունենալու ենք ամեն user-ի անվան մոտ **Client Tags կամ badges** — VIP (եթե գնում է vip package), New (եթե նոր է գրանցվել), At Risk (եթե վճարումը ուշացրել է), Beginner (եթե հաճախում է beginner level-ի class-ների), որոնք տրվելու են ավտոմատ:

**4.4.** Clients էջը պետք է ունենա որոնման և ֆիլտրացման հարմար համակարգ, որպեսզի admin-ը կարողանա արագ գտնել անհրաժեշտ client-ին և segment անել client base-ը ըստ կարգավիճակի, ակտիվության, փաթեթների և վարքագծի։

**4.4.1** Search \- Էջի վերևում պետք է լինի search input, որով հնարավոր է որոնել client-ներին հետևյալ տվյալներով՝

* Անուն / Ազգանուն  
* Հեռախոսահամար  
* Email  
* Client ID

admin-ը կարող է գրել client-ի անունը կամ հեռախոսահամարի մի մասը, և համակարգը պետք է անմիջապես ցույց տա համապատասխան արդյունքները։

### **4.4.2 Filters \-** Clients էջը պետք է ունենա հետևյալ ֆիլտրները՝

| Filter | Նկարագրություն |
| ----- | ----- |
| Filter by Client Tag / Badge | VIP, New, At Risk, Beginner և այլ ավտոմատ տրվող tags-երով ֆիլտրացում |
| Filter by Status | Active, Inactive, Frozen, Blocked |
| Filter by Package Type | Single class, Monthly package, VIP package |
| Filter by Class Level | Beginner, Intermediate, Advanced |
| Filter by Payment Status | Paid, Unpaid, Overdue, Partial |
| Filter by Source | Website, Mobile App, Admin, Instagram, Referral |
| Filter by Preferred Coach | ըստ նախընտրած coach-ի |
| Filter by Attendance Behavior | Regular, No-show, Often cancels, Low attendance |
| Filter by Birthday Month | birthday campaigns-ի համար |

### **4.4.3. Sort \-** Բացի filters-ից, պետք է լինի նաև sorting հնարավորություն՝

* # Newest clients first

* # Oldest clients first

* # Most active clients

* # Highest lifetime value

* # Last visit newest first

* # Last visit oldest first

* # Most bookings

* # Most cancellations

### **4.4.4. Quick Filters \-** Ավելի արագ աշխատանքի համար էջում կարող են լինել quick filter buttons՝

* # New Clients

* # VIP Clients

* # At Risk Clients

* # Unpaid Clients

* # Birthday This Month

* # Inactive 30+ Days

* # No-show Clients

# **5\. Coach Management**

Admin-ը պետք է կարողանա կառավարել coaches-ին։ այս էջում լինելու է լիստի կամ board view-ի տեսքով բոլոր ուսուցիչները որոնք ավելացնելու է ադմինը

Լինելու է add button, որի միջոցով ավելացվելու են coach-եր

**5.1.** Add սեղմելուց հետո բացվելու է հետևյալ field-երը

* Photo  
* Name surname   
* date of birth  
* phone number   
* Email  
* Class type   
* Level  
* Salary price  
* Bio,   
* Experience,  
* Video url,   
* working days and hours (hhave possibility to add several spots)

**5.2.** Coach profile-ը պետք է ունենա ցուցակ, որտեղ ցուցադրվելու են բոլոր coach/instructor-ներ\` list-ի տեսքովը, իսկ լիստը պետք է ներառի ՝

* Photo  
* Name and phone number (coach name should be clickable, and after clicking it should open coach’s data and information, the opening can be with right slide sheet \- the data should be: Bio, Experience, video, Assigned classes, date of birth, all lifetime history, salary history, working graphic to add availability and classes day and time with spots)  
* Specialization  
* Total students (users)  
* Salary  
* Actions (delete, edit, deactivate)

**5.3.** Admin-ը կարող է կատարել հետևյալ գործողությունները՝

* Add coach  
* Edit coach profile  
* Assign coach to class (Substitute coach (օրինակ եթե պարզվում է որ ինտրուկտորը այդ օրվա դասը չի կարող անցկացնել, և հնարավոր չի չեղարկել, ապա կարող է լինել հնարավորություն փոխարինել ինստրուկտորին)  
* Remove coach from schedule  
* Deactivate/ activate coach

**5.4.** Coaches էջը պետք է ունենա որոնման և ֆիլտրացման հարմար համակարգ, որպեսզի admin-ը կարողանա արագ գտնել coach-ին, տեսնել նրա ակտիվությունը, դասերի ծանրաբեռնվածությունը և performance-ը։

### **5.4.1. Search \-** Էջի վերևում պետք է լինի search input, որով հնարավոր է որոնել coach-երին հետևյալ տվյալներով՝

* Անուն / Ազգանուն  
* Հեռախոսահամար  
* Coach ID  
* Մասնագիտացում / class type

### 

### **5.4.2. Filters- ** coach էջը պետք է ունենա հետևյալ ֆիլտրները՝

| Filter | Նկարագրություն |
| :---- | ----- |
| Filter by Status | Active, Inactive, On Vacation, Blocked |
| Filter by Class Type | Yoga, Pilates, Fitness, Dance և այլ class տեսակներ |
| Filter by Class Level | Beginner, Intermediate, Advanced |
| Filter by Schedule Days | Monday–Sunday օրերով |
| Filter by Working Hours | Առավոտյան, ցերեկային, երեկոյան ժամեր |
| Filter by Cancellation Rate | հաճախ cancel արվող դասերով coach-եր |

### **5.4.3. Sort \-** Բացի filters-ից, պետք է լինի նաև sorting հնարավորություն՝

* # Newest coaches first

* # Oldest coaches first

* # Highest rated

* # Most booked

* # Highest revenue generated

* # Lowest cancellation rate

### **5.4.4. Quick Filters \-** Ավելի արագ աշխատանքի համար էջում կարող են լինել quick filter buttons՝

* # Fully Booked

* # Top Rated

* # Most Booked

* # New Coaches

* # Low Attendance Classes

* # High Cancellation Rate

# **6\. Schedule**

**6.1.** Schedule էջը նախատեսված է studio-ի բոլոր դասերի ժամանակացույցը կառավարելու համար։ Այս էջում admin-ը պետք է կարողանա տեսնել, ստեղծել, խմբագրել և վերահսկել բոլոր upcoming և past classes-ները՝ ըստ օրվա, շաբաթվա կամ calendar view-ի\` monthly։

**6.2.** Schedule էջը պետք է ցույց տա՝

* որ օրը ինչ դասեր կան  
* դասի ժամը  
* class type-ը  
* coach-ը  
* դասի capacity-ն  
* քանի տեղ է արդեն լրացված  
* քանի ազատ տեղ է մնացել  
* waitlist-ի քանակը  
* դասի status-ը

Օրինակ՝  
 **Monday, 18:00 — Pilates Beginner — Coach Anna — 8/12 booked — 4 spots left**

**6.3 Schedule Views \-** Schedule էջը պետք է ունենա մի քանի տեսք։

| View | Նկարագրություն |
| :---- | :---- |
| Calendar View | Ամսական calendar, որտեղ ամեն օրվա տակ երևում են այդ օրվա դասերը |
| Weekly View | Շաբաթական գրաֆիկ՝ օրերով և ժամերով բաժանված |
| Daily View | Մեկ օրվա բոլոր դասերը՝ list կամ timeline տեսքով |
| List View | Բոլոր դասերը ցուցակով՝ filters-ով և search-ով |

## **6.4 Schedule List-ի դաշտերը**

Յուրաքանչյուր class/session-ի համար պետք է ցուցադրվեն հետևյալ դաշտերը․

| Դաշտ | Նկարագրություն |
| ----- | ----- |
| Class Name | Դասի անունը, օրինակ՝ Pilates Beginner |
| Class Type | Yoga, Pilates, Fitness, Dance և այլն |
| Class Level | Beginner, Intermediate, Advanced |
| Date | Դասի օրը |
| Start Time | Դասի սկիզբը |
| End Time | Դասի ավարտը |
| Duration | Դասի տևողությունը |
| Coach | Դասը վարող coach-ը |
| Capacity | Ընդհանուր տեղերի քանակը |
| Booked Count | Քանի client է գրանցվել |
| Spots Left | Քանի ազատ տեղ է մնացել |
| Waitlist Count | Քանի հոգի է waitlist-ում |
| Attendance Count | Քանի հոգի է իրականում ներկա եղել |
| Status | Scheduled, Full, Completed, Cancelled |
| Actions | View, Edit, Cancel, Duplicate, Mark Completed |

## 

## 

## **6.5 Filters \-** Schedule էջը պետք է ունենա հետևյալ filters-ը․

| Filter | Նկարագրություն |
| :---- | :---- |
| Filter by Date | ընտրել կոնկրետ օր կամ ժամանակահատված |
| Filter by Coach | տեսնել կոնկրետ coach-ի դասերը |
| Filter by Class Type | Yoga, Pilates, Fitness և այլն |
| Filter by Class Level | Beginner, Intermediate, Advanced |
| Filter by Status | Scheduled, Full, Completed, Cancelled |
| Filter by Availability | Available spots, Full classes, Waitlist active |
| Filter by Time of Day | Morning, Afternoon, Evening |

## **6.6 Search \-** Էջում պետք է լինի search input, որով admin-ը կարող է որոնել՝

* class name-ով  
* coach-ի անունով  
* class type-ով

## 

## **6.7 Quick Filters**

* Today’s Classes  
* This Week  
* Available Spots  
* Full Classes  
* Waitlist Active  
* Cancelled Classes  
* Beginner Classes  
* Evening Classes

**6.8 Actions**

Admin-ը յուրաքանչյուր դասի համար պետք է կարողանա կատարել հետևյալ actions-ը․

| Action | Նկարագրություն |
| :---- | :---- |
| View Class | բացել class-ի ամբողջական տվյալները |
| Edit Class | փոխել ժամը, coach-ը, capacity-ն կամ այլ տվյալներ |
| Cancel Class | չեղարկել դասը |
| Add Client | ձեռքով client գրանցել դասին |
| Move Clients | տեղափոխել clients-ին մեկ այլ դաս |
| Change teacher | Փոխարինել մեկ այլ դասատույով |
| View Attendance | տեսնել ովքեր են ներկա եղել |

**6.9. Class Statuses**

Schedule-ի դասերը կարող են ունենալ հետևյալ status-ները․

| Status | Նկարագրություն |
| :---- | :---- |
| Scheduled | դասը պլանավորված է |
| Open | դասը հասանելի է booking-ի համար |
| Full | բոլոր տեղերը լրացված են |
| Waitlist Active | տեղ չկա, բայց waitlist-ը բաց է |
| Completed | դասը ավարտվել է |
| Cancelled | դասը չեղարկվել է |
| Draft | դասը դեռ հրապարակված չէ |

## **6.10 Working Graphic / Coach Schedule**

Schedule էջում պետք է լինի նաև coach-երի working graphic-ի կառավարում։

Յուրաքանչյուր coach-ի համար պետք է հնարավոր լինի նշել՝

* working days  
* working hours  
* break time  
* vacation days  
* unavailable dates  
* max classes per day  
* class types, որոնք coach-ը կարող է վարել

Օրինակ՝  
 **Coach Anna — Monday/Wednesday/Friday — 10:00–18:00 — Pilates, Stretching**

# **7\. Packages**

**7.1.** Admin-ը պետք է կարողանա ստեղծել, կառավարել և ավելացնել class package-ներ՝ class type-եր, այստեղ ավելանում են իրենց բոլոր դասերի տեսակները՝ իրենց փաթեթներով և արժեքներով, օրինակ reformer group, reformer individual, mat pilates, yoga, dances։

**7.2.** Այս էջում ցուցադրվելու է բոլոր classes package-ները լիստ կամ board view-ով, ադմինը սեղմելու է add button-ի վրա և ավելացնի դասը

**7.3.** Դաս ավելացնելը ունենալու է հետևյալ field-երը՝

* Class name (որը հանդիսանալու է հենց class type-ը, և ամեն coach add անելուց class type field-ում լինելու է dropdown menu-ում)  
* Description  
* Capacity  
* Level  
* Session quantity with its price and guest quantity (need to have add button to have possibility to add more sessions with prices)  
* Coaches list to have possibility to choose coaches that have this class  
* Actions \-delete, edit,  deactivate

# **8\. Gift Cards Management**

**8.1.** Admin-ը պետք է կարողանա ստեղծել, կառավարել և ավելացնել gift card-ներ Այս էջում լինելու է add button և ցուցադրվելու է  բոլոր gift cards-երը՝ լիստի տեսքով

**8.2.** Լիստը ներառելու է՝

* Purchaser name  
* Amount  
* Status  
* Created date  
* Expiration date

**8.3.** Admin-ը կարող է՝

* Create gift card manually and assign user  
* Deactivate gift card  
* View redemption history  
* Resend gift card

# **9\. Finance**

9.1. Admin-ը պետք է ունենա ֆինանսական անալիտիկա, կառավարի membership plans-ը, payments-ը և billing history-ն՝ լիստի տեսքով, ցուցակով պետք է տեսնի բոլոր տվյալները։

9.2. Ֆինանսը պետք է բաժանված լինի 2 tab-ի՝ User finance և coaches finance

9.3. User finance tab-ը Պետք է ներառի՝

* User name and phone number  
* Membership package or plan name  
* Cost  
* Expiration date  
* Payment status (dropdown menu: paid, pending, canceled, cash)  
* Discount/gift card used  
* Actions (should be with action icons with dropdown menus if needed)  
  * edit,   
  * pause membership,   
  * send refund request,   
  * notification(after clicking this icon it send notification to the user, the message templates should be with dropdown menu to help admin choose which one is needed(the notification templates managed from notification management page)))

9.4. Coach finance tab-ը, նախաֆեսված է coach-երի աշխատավարձը կառավարելու համար,  Պետք է ներառի՝

* Coach name and phone number  
* Cost (monthly salary price)  
* Session counts (the number should be clickable, after that should open the right side sheet which should show the date and time, class type of the session for what she get a salary  
* Month  
* Payment status (dropdown menu: paid, pending, canceled, cash)  
* Actions (should be with action icons with dropdown menus if needed)  
  * edit,   
  * pause,

# **10\. Analytics**

10.1. Admin-ը պետք է տեսնի studio-ի key metrics-ը՝ լիստի՝ սյունյակների, նաև chart-երի տեսքով, որոնք Պետք է ներառեն՝

* Revenue report  
* Bookings report  
* Attendance report  
* Membership report  
* User activity report  
* Class popularity  
* Coach performance  
* Preferred coaches (Revenue per coach)  
* Preferred classes type (Revenue per class)

10.2. Այս էջում առկա անալիտիկան կամ Reports-ը պետք է կարողանալ export անել՝ CSV կամ Excel ֆոռմատով։

# 

# **11\. Notifications Management**

**11.1.** Admin-ը պետք է կարողանա ուղարկել և կառավարել notifications, ստեղ լինելու են tamplate-ներ՝ տեքստի տեսքով, որը ադմինը edit անելու ընտրի ում ուղարկի, կարա ընտրի, որ class type-ի համարա էդ message-ը կամ ինչ ստատուս ունեցող user-ների ու ուղարկի notification-ներ:։

**11.2.** Notification types-երը հետևյալն են՝

* Booking reminder  
* Waitlist update  
* Event announcement  
* Promotion  
* Community update

**11.3.** Admin-ը կարող է՝

* Add/edit/delete new message  
* Choose class type to send message  
* Choose status to send message (for example user’s who need to pay the monthly or daily or other fee, status can be All users, Active members, Inactive users, Waitlisted users, Users with upcoming booking)  
* Send push notification  
* Send email notification  
* Schedule notification  
* View delivery status

# **12\. Settings**

Admin Settings-ում պետք է լինեն՝

* Admin panel passwords  
* Cancellation policy  
* Languages

## 

## **13\. CORE ENTITIES**

* User  
* Client  
* Coach  
* Booking  
* Session  
* Package  
* Membership  
* WaitlistEntry  
* Invoice  
* Payment  
* Notification  
* Attendance  
* Subscription  
* GiftCard

## 

## **14\. RELATIONSHIPS**

* Client HAS MANY bookings  
* Booking BELONGS TO session  
* Session HAS ONE coach  
* Package DEFINES booking limits  
* WaitlistEntry CONNECTS user ↔ class

## **15\. allowed transitions**

* Booked \-\> Completed  
* Booked \-\> Cancelled  
* Waitlisted \-\> Booked  
* Completed \-\> Refunded ❌ NOT ALLOWED

## **16\. Business Rules**

* User cannot book same session twice  
* Waitlist auto-promotes first user  
* Cancellation before 12h \= refund  
* Session limit decreases only after attendance  
* Membership freezes pause expiration

**17\. Booking flow**

User books class

↓

Validate package

↓

Check capacity

↓

If full → waitlist

↓

Send notification

↓

Create attendance placeholder

↓

Update analytics

# **18\. Technical conventions**

* UUID everywhere  
* Soft delete only  
* Audit logs required  
* Timezone strategy  
* Error format  
* Pagination standard  
* Naming convention  
* File storage strategy

# User Account

# **USER ACCOUNT**

My Account բաժինը user-ի personal profile և account management կենտրոնն է, որը պետք է ներառի

### **Progress / Achievements**

Progress / Achievements բաժինը նախատեսված է user-ի activity-ի, զարգացման և ներգրավվածության ցուցադրման համար։

Այս բաժինը պետք է հանդիսանա user-ի **անձնական analytics dashboard**, որտեղ նա կարող է հետևել իր մասնակցությանը, արդյունքներին և ձեռքբերումներին։

Բաժինը պետք է ոչ միայն տեղեկատվական լինի, այլ նաև ստեղծի motivation և encourage անի user-ին շարունակել իր ակտիվությունը։

## **Էջի կառուցվածք**

Progress էջը պետք է ներառի հետևյալ հիմնական հատվածները՝

1. **Activity Summary (Analytics)**  
2. **Performance Metrics**  
3. **Achievements**

## **1️⃣ Activity Summary (Analytics)**

User-ը պետք է կարողանա ընտրել ժամանակահատված՝

* This month  
* This year  
* All time

User-ին պետք է ցուցադրվեն հետևյալ հիմնական metrics-ը՝

* Total classes (selected period)  
* Total hours spent (օրինակ՝ Pilates hours)  
* Total sessions completed  
* Active days (քանի օր է մասնակցել)

## 

## **2️⃣ Performance Metrics**

Պետք է ցուցադրվեն՝

* Most visited class type  
* Favorite instructor  
* Most active day of the week  
* Preferred time (morning / evening)

## **3️⃣ Achievements**

## **Structure**

Achievements-ը պետք է ներկայացվեն որպես visual badges կամ cards։ Յուրաքանչյուր achievement պետք է ունենա՝

* Title  
* Short description  
* Unlock condition  
* Status (locked / unlocked)

## **Achievement Types (օրինակներ)**

* First Class Completed  
* 5 Classes Completed  
* 10 Classes Completed  
* 50 Classes Completed  
* 100 Classes Completed

## **Advanced**

* Progress bar դեպի հաջորդ achievement  
* “You’re 2 classes away from your next achievement”

## 

## **Memberships & Billing**

Այս բաժնում user-ը պետք է կարողանա կառավարել իր membership-ը։

Պետք է ներառի՝

* Current membership plan  
* Sessions remaining  
* Renewal date  
* Billing history  
* Payment method  
* Upgrade / downgrade option  
* Pause membership option  
* Cancel membership option

## 

## **Gift Cards**

Gift Cards բաժնում user-ը պետք է կարողանա՝

* գնել gift card  
* տեսնել իր active gift cards-ը  
* ուղարկել gift card ուրիշ user-ի  
* redeem անել gift card

Gift Card purchase flow-ը պետք է ներառի՝

* Recipient name  
* Recipient email / phone  
* Message  
* Payment  
* Confirmation

## 

## **Settings**

Settings բաժինը պետք է ներառի՝

### **Personal Details**

* Name  
* Phone number  
* Email  
* Date of birth  
* Profile photo

### 

### **Notifications**

User-ը պետք է կարողանա կառավարել՝

* Booking reminders  
* Waitlist notifications  
* Promotions  
* Community updates

### **Security**

* Change password  
* Logout  
* Delete account request

# Coach pannel

# **Coach Pannel**

# Functional Requirements

## **Ընդհանուր նկարագրություն**

Coach-ը հարթակի այն role-ն է, որը նախատեսված է մարզչի անձնական schedule-ը, assigned classes-ը և class participants-ը կառավարելու համար։ Coach-ը հիմնականում օգտագործում է համակարգը իր դասերի ընթացքը վերահսկելու, attendee list-ը տեսնելու և attendance-ը նշելու նպատակով։

Coach-ը չունի ամբողջական administrative access և չի կարող փոփոխել համակարգի հիմնական կարգավորումները, ֆինանսական տվյալները, memberships-ը կամ այլ coaches-ի տվյալները։ Նրա հասանելիությունը սահմանափակվում է միայն իր հետ կապված classes-ով և user activity-ով։

Coach role-ի հիմնական նպատակն է օգնել մարզչին ավելի կազմակերպված աշխատել, տեսնել իր դասերի մասնակցությունը և ապահովել ավելի լավ experience client-ի համար։

**Coach Panel-ի բաժիններ**

Coach Panel-ը ունի հետևյալ հիմնական բաժինները՝

1. Dashboard  
2. My Schedule / Calendar  
3. Appointments  
4. Salary  
5. Analytics  
6. Profile Settings

# **1\) Dashboard**

Dashboard-ը տալիս է արագ overview իր օրվա և ընդհանուր ակտիվության վերաբերյալ։

## **Պետք է ցուցադրվի՝**

* Today’s classes (քանի դաս ունի այսօր)  
* Total booked clients (այսօրվա գրանցվածներ)  
* Upcoming classes (մոտակա դասերը)  
* Waitlist count (իր դասերի համար)  
* Quick stats (օրինակ՝ այս շաբաթվա դասերի քանակ)

# **2\) My Schedule / Calendar**

Այս բաժնի նպատակն է տեսնել դասերի ժամանակացույցը calendar ձևաչափով։

## **View types**

* Daily view  
* Weekly view

## **Calendar-ում պետք է երևա՝**

* Class name  
* Time  
* Duration  
* Booked count / capacity  
* Status (active / full / cancelled)

## **Functional**

Coach-ը կարող է՝

* սեղմել class-ի վրա → բացել class view  
* արագ հասկանալ իր ազատ և զբաղված ժամերը

# **3\) My Groups**

Coach-ին տալ հնարավորություն տեսնելու և կառավարելու իր խմբերը (classes) և դրանցում գրանցված աշակերտներին՝ մեկ կենտրոնացված workflow-ով։

### 

### **3.1 Groups Tabs**

Եթե coach-ը դասավանդում է մի քանի group կամ class type, պետք է լինի tabs համակարգ։

Օրինակ՝

* Reformer  
* Yoga  
* Barre  
* Prenatal

Tab ընտրելուց հետո system-ը պետք է ցույց տա միայն տվյալ group-ի schedule-ը և participants-ը։

### **3.2 Date Selector**

Groups tabs-ի տակ պետք է լինի date selector՝ calendar-style տեսքով։

Պետք է ցուցադրվեն՝

* Month  
* Week days  
* Dates  
* Selected date

Coach-ը ընտրում է կոնկրետ օր, և ներքևում ցուցադրվում են այդ օրվա sessions-ը։

### **3.3 Sessions List**

Ընտրված օրվա համար պետք է ցուցադրվի sessions list։

Յուրաքանչյուր session row/card պետք է ներառի՝

* Start time  
* Duration  
* Group / class name  
* Booked count  
* Waitlist count  
* Status

Օրինակ՝

* 7:00 PM  
* 50 min  
* Yoga  
* 10 booked / 10 capacity  
* 2 waitlisted


### **3.4 Session Participants**

Session-ի վրա սեղմելուց պետք է բացվի տվյալ session-ի participants view։

Այստեղ պետք է երևան՝

#### **Booked Users**

* User name  
* Contact կամ profile shortcut  
* Booking status  
* Attendance status

  #### **Waitlist Users**

* User name  
* Waitlist position


### **3.6 Empty States**

Եթե ընտրված օրը session չկա՝ **No sessions for this day**

Եթե session-ում participant չկա՝ **No booked users yet**

Եթե waitlist չկա՝ **No users in waitlist**

# **4\) Salary**

Այս բաժնի նպատակն է տալ թափանցիկ տեղեկատվություն եկամուտների վերաբերյալ։

## **Պետք է ցուցադրվի՝**

* Total earnings (ընտրված period-ի համար)  
* Earnings per class  
* Number of completed classes  
* Payment status (paid / pending)

## **Period selector**

* This week  
* This month  
* Custom range

## **Functional**

Coach-ը կարող է՝

* տեսնել իր earnings breakdown-ը  
* հասկանալ թե որ դասերից որքան եկամուտ է ստացել

👉 Coach-ը չի կարող edit անել որևէ ֆինանսական տվյալ

# **5\) Analytics**

Այս բաժնի նպատակն է ցույց տալ  performance-ը և օգնել բարելավել արդյունքները։

## **Metrics**

* Total classes taught  
* Total clients trained  
* Average attendance rate  
* Class fill rate (%)  
* Most popular class type  
* Peak time (երբ է ամենաշատ attendance)

## **Visual**

* Simple charts (bar / line)  
* Period selector (month / year)

## **Functional**

Coach-ը կարող է՝

* տեսնել իր performance trends-ը  
* հասկանալ իր strong / weak կողմերը

# **6\) Profile Settings**

Այս բաժնի նպատակն է անձնական տվյալների կառավարում։

## **Պետք է ներառի՝**

* Profile photo  
* Name  
* Bio  
* Specialization  
* Experience

## **Settings**

* Change password  
* Language  
* Notifications

## **Restrictions**

Coach-ը չի կարող՝

* փոխել system settings  
* փոխել այլ users-ի տվյալներ  
* կառավարել memberships կամ payments

# Manager Role

## **Manager Pannel**

## Ընդհանուր նկարագրություն

Manager-ը հարթակի օպերացիոն կառավարման դեր կատարողն է, ով պատասխանատու է studio-ի ամենօրյա գործընթացների կազմակերպման և վերահսկման համար։ Նա աշխատում է Admin-ի համար սահմանված համակարգի շրջանակներում և ապահովում է, որ classes-ը, bookings-ը և user activity-ն իրականացվեն հստակ և առանց խափանումների։

Manager-ը ունի լայն հասանելիություն համակարգի հիմնական բաժիններին և կարող է կառավարել դասերը, schedule-ը, bookings-ը և հաճախորդների տվյալները՝ ապահովելով հարթակի սահուն աշխատանքը։ 

Միևնույն ժամանակ, նրա հասանելիությունը սահմանափակված է բարձր մակարդակի գործողությունների նկատմամբ, ինչպիսիք են ֆինանսական տվյալների լիարժեք կառավարումը կամ համակարգի կարևոր կարգավորումների փոփոխությունը։

| Section | Admin | Manager | Manager Notes / Restrictions |
| :---- | :---: | :---: | ----- |
| Dashboard | ✅ | ✅ | տեսնում է operational overview |
| Classes | ✅ | ✅ | կարող է create/edit անել, բայց չի կարող delete անել |
| Bookings / Schedule / Calendar | ✅ | ✅ | կարող է manage անել bookings-ը և schedule-ը |
| Waitlists | ✅ | ✅ | կարող է move/remove/notify անել users-ին |
| Clients | ✅ | ✅ | Manager-ը կարող է edit անել basic client info |
| Coaches | ✅ | ✅ | կարող է edit անել basic coach info, բայց չի կարող deactivate/delete անել |
| Gift Cards | ✅ | ✅ | կարող է view/resend անել, բայց չի կարող create/delete անել |
| Memberships & Billing | ✅ | ❌ |  |
| Notifications | ✅ | ❌ |  |
| Reports & Analytics | ✅ | ❌ |  |
| Settings | ✅ | ❌ |  |

# Content man. Role

# **Content Management**

Content manager-ը պետք է կարողանա կառավարել և app-ի, և website-ի content-ը։

Բաժիններ՝

* Events \- add / delete / hide  
* Blog \- add / delete / hide  
* News  \- add / delete / hide  
* Updates  \- add / delete / hide  
* Classes  \- add / delete / hide  
* Changes banners  \- add / delete / hide  
* Edit cancelation policy  
* Edit about info