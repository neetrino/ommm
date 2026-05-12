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
2. **Classes**  
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
3. Coaches  
4. Memberships  
5. Explore \- events, news  
6. My Account  
7. Contact Us

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

Admin Panel-ի նպատակն է ապահովել Ommm. studio-ի ներքին թիմի համար հարմար dashboard, որտեղ նրանք կարող են կառավարել classes-ը, bookings-ը, clients-ը, coaches-ը, memberships-ը, payments-ը, content-ը և notifications-ը։

Admin Panel-ը public-facing չէ։ Այն նախատեսված է միայն authorized team members-ի համար։

**Admin Panel-ի բաժիններ**

Admin Panel-ը հանդիսանում է հարթակի կառավարման համակարգը և ունի հետևյալ հիմնական բաժինները՝

1. Dashboard  
2. Classes  
3. Bookings / Schedule / Calendar  
4. Waitlists  
5. Clients  
6. Coaches  
7. Memberships & Billing  
8. Gift Cards  
9. Notifications  
10. Reports & Analytics  
11. Settings  
12. Content management

# 

# 

# **1\) Dashboard**

Dashboard-ը պետք է admin-ին տա արագ overview studio-ի վիճակի մասին։

Պետք է ցուցադրվի՝

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

# **2\) Classes Management**

Admin-ը պետք է կարողանա ստեղծել և կառավարել class schedule-ը։

Admin-ը կարող է՝

* Create class  
* Edit class  
* Cancel class  
* Duplicate class  
* Set recurring schedule  
* Assign coach  
* Set capacity  
* Set duration  
* Set price/session requirement  
* Manage availability status

## 

## 

## **Class fields**

Յուրաքանչյուր class պետք է ունենա՝

* Class name  
* Description  
* Date  
* Start time  
* End time / duration  
* Coach  
* Capacity  
* Level  
* Class type  
* Status: Active / Cancelled / Full / Draft

# **3\) Booking Management**

Admin-ը պետք է կարողանա տեսնել և կառավարել բոլոր bookings-ը։

Պետք է ներառի՝

* All bookings list  
* Filter by date  
* Filter by class  
* Filter by client  
* Filter by coach  
* Filter by status  
* Booking detail page

## **Admin actions**

Admin-ը կարող է՝

* View booking  
* Cancel booking  
* Move user to another class  
* Mark as attended  
* Add internal note

## **Booking statuses**

* Booked  
* Completed  
* Cancelled  
* Waitlisted

Admin-ը կկարողանա bookings-ը և classes schedule-ը տեսնել calendar view-ով՝ տարբեր կտրվածքներով՝ 

* Monthly view  
* Weekly view  
* Daily view

# 

# **4\) Waitlist Management**

Admin-ը պետք է կարողանա վերահսկել waitlist-ը։

Պետք է ներառի՝

* Waitlisted users  
* Class waitlist count  
* User position  
* Notification status

Admin-ը կարող է՝

* Move user from waitlist to booking  
* Remove user from waitlist  
* Notify user manually  
* Set auto-notify when spot opens

# **5\) Client Management**

Admin-ը պետք է կարողանա տեսնել user profiles-ը և դրանց activity-ն։

Client profile-ը պետք է ներառի՝

* Name  
* Phone  
* Email  
* Date of birth  
* Membership status  
* Sessions remaining  
* Booking history  
* Payment history  
* Gift cards  
* Notes

Admin-ը կարող է՝

* Edit client info  
* View activity  
* Add note  
* Pause membership  
* Cancel membership  
* Assign package manually  
* Give gift cards

# **6\) Coach Management**

Admin-ը պետք է կարողանա կառավարել coaches-ին։

Coach profile-ը պետք է ներառի՝

* Name  
* Photo  
* Bio  
* Specialization  
* Experience  
* Assigned classes  
* Availability  
* Status: Active / Inactive

Admin-ը կարող է՝

* Add coach  
* Edit coach profile  
* Assign coach to class  
* Remove coach from schedule  
* Deactivate coach  
* Substitute coach (օրինակ եթե պարզվում է որ ինտրուկտորը այդ օրվա դասը չի կարող անցկացնել, և հնարավոր չի չեղարկել, ապա կարող է լինել հնարավորություն փոխարինել ինստրուկտորին)

# **7\) Memberships & Billing Management**

Admin-ը պետք է կառավարի membership plans-ը, payments-ը և billing history-ն։

Պետք է ներառի՝

* Membership plans list  
* Active subscriptions  
* Expired subscriptions  
* Paused memberships  
* Payment history  
* Failed payments

Admin-ը կարող է՝

* Create membership plan  
* Edit plan price  
* Set session limit  
* Set renewal period  
* Pause membership  
* Cancel membership  
* Add manual payment  
* Refund request mark անել

# **8\) Gift Cards Management**

Admin-ը պետք է կառավարի gift cards-ը։

Պետք է ներառի՝

* Gift card list  
* Purchaser  
* Recipient  
* Amount  
* Balance  
* Status  
* Expiration date

Admin-ը կարող է՝

* Create gift card manually  
* Deactivate gift card  
* View redemption history  
* Resend gift card

# **9\) Notifications Management**

Admin-ը պետք է կարողանա ուղարկել և կառավարել notifications։

Notification types՝

* Booking reminder  
* Waitlist update  
* Event announcement  
* Promotion  
* Community update

Admin-ը կարող է՝

* Send push notification  
* Send email notification  
* Select audience  
* Schedule notification  
* View delivery status

Audience examples՝

* All users  
* Active members  
* Inactive users  
* Waitlisted users  
* Users with upcoming booking

# **10\) Reports & Analytics**

Admin-ը պետք է տեսնի studio-ի key metrics-ը։

Պետք է ներառի՝

* Revenue report  
* Bookings report  
* Attendance report  
* Membership report  
* User activity report  
* Class popularity  
* Coach performance

Reports-ը պետք է կարողանան export լինել՝ CSV կամ Excel

# 

# **11\) Settings**

Admin Settings-ում պետք է լինեն՝

* Studio info  
* Working hours  
* Cancellation policy  
* Booking rules  
* Languages  
* Notification templates \- ?

# **12\) Content Management**

Admin-ը պետք է կարողանա կառավարել և app-ի, և website-ի content-ը։

Բաժիններ՝

* Events \- add / delete / hide  
* Blog \- add / delete / hide  
* News  \- add / delete / hide  
* Updates  \- add / delete / hide  
* Classes  \- add / delete / hide  
* Changes banners  \- add / delete / hide  
* Edit cancelation policy  
* Edit about info


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