# 🏢 VoiceAI Studio — Complete Admin & User Panel Workflows

---

# 🔐 WHO LOGS IN — OVERVIEW

```mermaid
graph TB
    APP(["🌐 VoiceAI Studio"])

    APP --> ADMIN_LOGIN["👑 Admin Login\nadmin@company.com"]
    APP --> USER_LOGIN["👤 User Login\nuser@company.com"]

    ADMIN_LOGIN --> ADMIN_PANEL["ADMIN PANEL\n────────────────\n• Manage all users\n• Buy phone numbers\n• Create AI Employees\n• Set plans & limits\n• See ALL analytics\n• Billing control\n• System settings"]

    USER_LOGIN --> USER_PANEL["USER PANEL\n────────────────\n• Create own AI Employees\n• Make instant calls\n• Run bulk campaigns\n• Setup inbound calls\n• View own results\n• Read conversations\n• Check performance"]
```

---

# ═══════════════════════════════
# 👑 ADMIN PANEL — COMPLETE FLOW
# ═══════════════════════════════

## 🗺️ Admin Master Navigation

```mermaid
flowchart TD
    ADMIN_HOME["👑 Admin Dashboard"] --> SECTIONS

    SECTIONS --> S1["📊 Overview & Analytics"]
    SECTIONS --> S2["👥 User Management"]
    SECTIONS --> S3["📞 Phone Numbers"]
    SECTIONS --> S4["🤖 Employee Templates"]
    SECTIONS --> S5["📢 All Campaigns Monitor"]
    SECTIONS --> S6["💬 All Conversations"]
    SECTIONS --> S7["📈 Platform Performance"]
    SECTIONS --> S8["💳 Billing & Plans"]
    SECTIONS --> S9["⚙️ System Settings"]
    SECTIONS --> S10["🚨 Alerts & Logs"]
```

---

## 👑 A1 — ADMIN LOGIN

```mermaid
flowchart TD
    OPEN(["Admin opens app"]) --> LOGIN_PAGE["Login Page"]
    LOGIN_PAGE --> EMAIL["Enter admin email"]
    EMAIL --> PASS["Enter password"]
    PASS --> SUBMIT["Click Login"]
    SUBMIT --> CHECK{Is admin account?}
    CHECK -->|Yes| ADMIN_DASH["✅ Redirected to\nAdmin Dashboard"]
    CHECK -->|No user| ERR["❌ Wrong credentials\nShow error"]
    CHECK -->|Regular user| USER_DASH["Redirected to User Panel"]
    ERR --> LOGIN_PAGE
```

---

## 👑 A2 — ADMIN OVERVIEW (Dashboard)

```mermaid
flowchart TD
    DASH2["👑 Admin Overview"] --> STATS

    subgraph STATS["Platform-Wide Stats (live)"]
        ST1["👥 Total Users: 142"]
        ST2["🤖 Total AI Employees: 389"]
        ST3["📞 Total Calls Today: 12,847"]
        ST4["🔥 Hot Leads Today: 1,420"]
        ST5["📢 Active Campaigns: 23"]
        ST6["💰 Revenue This Month: ₹2,84,000"]
        ST7["⚠️ Low Balance Users: 3"]
    end

    DASH2 --> CHARTS["Charts:"]
    CHARTS --> CH1["📈 Daily call volume graph"]
    CHARTS --> CH2["🌐 Language distribution pie"]
    CHARTS --> CH3["🔥 Conversion rate by day"]
    CHARTS --> CH4["💳 Revenue trend"]

    DASH2 --> ALERTS2["🚨 System Alerts:"]
    ALERTS2 --> AL1["VoBiz API: ✅ Healthy"]
    ALERTS2 --> AL2["Sarvam AI: ✅ Healthy"]
    ALERTS2 --> AL3["Groq API: ✅ Healthy"]
    ALERTS2 --> AL4["3 users below ₹500 balance ⚠️"]
```

---

## 👑 A3 — USER MANAGEMENT

```mermaid
flowchart TD
    UM2["👥 User Management Page"] --> ACTIONS5

    subgraph ACTIONS5["Admin can:"]
        ACT1_A["➕ Create new user account"]
        ACT2_A["📋 View all users list"]
        ACT3_A["🔍 Search user by email/name"]
        ACT4_A["✏️ Edit user details"]
        ACT5_A["🚫 Suspend user"]
        ACT6_A["✅ Activate suspended user"]
        ACT7_A["🗑️ Delete user"]
        ACT8_A["👁️ View user's dashboard"]
    end

    ACT1_A --> CREATE_USER

    subgraph CREATE_USER["Create New User Form"]
        CU1["Full Name"]
        CU2["Email address"]
        CU3["Temporary password"]
        CU4["Assign Plan\n(Free / Starter / Pro / Enterprise)"]
        CU5["Set limits:\n• Max employees allowed\n• Max phone numbers\n• Max calls/month"]
        CU6["Click 'Create User'"]
        CU7["User gets welcome email\nwith login link"]
    end

    ACT4_A --> EDIT_USER

    subgraph EDIT_USER["Edit User Panel"]
        EU1["Change plan tier"]
        EU2["Change call limits"]
        EU3["Add/reduce credits"]
        EU4["Reset password"]
        EU5["View activity log"]
    end
```

---

## 👑 A4 — PHONE NUMBERS (Admin Manages the Pool)

```mermaid
flowchart TD
    PN2["📞 Phone Numbers\n(Admin manages ALL numbers)"] --> VIEW2["View all purchased numbers\nwith assignment status"]

    VIEW2 --> TABLE3["Numbers Table:"]
    TABLE3 --> ROW2["Each row:\n📞 Number | Country | Status | Assigned To | Monthly Cost"]

    VIEW2 --> BUY2["➕ Buy New Numbers"]
    BUY2 --> B_FLOW

    subgraph B_FLOW["Buy Number Flow"]
        BF1["Select Country: India 🇮🇳"]
        BF2["Select Type: Local / Mobile / Toll-Free"]
        BF3["Browse available inventory\nfrom VoBiz"]
        BF4["Select quantity (buy in bulk)"]
        BF5["Confirm purchase"]
        BF6["Numbers added to platform pool"]
        BF1 --> BF2 --> BF3 --> BF4 --> BF5 --> BF6
    end

    VIEW2 --> ASSIGN_NUM["Assign Number to User"]
    ASSIGN_NUM --> AN1["Pick a number from pool"]
    AN1 --> AN2["Select which user gets it"]
    AN2 --> AN3["✅ User can now see & use\nthis number in their panel"]

    VIEW2 --> RELEASE["Release Number"]
    RELEASE --> REL1["Remove from user"]
    REL1 --> REL2["Back to pool\nor delete from VoBiz"]
```

---

## 👑 A5 — EMPLOYEE TEMPLATES (Admin Creates Ready Templates)

```mermaid
flowchart TD
    ET["🤖 Employee Templates\n(Admin creates reusable templates\nusers can deploy with 1 click)"] --> CREATE_TEMP["Create New Template"]

    CREATE_TEMP --> TF

    subgraph TF["Template Form"]
        TF1["Template Name:\n'Hindi Sales Agent v1'"]
        TF2["Target Language: Hindi"]
        TF3["Goal: Lead Qualification"]
        TF4["Pre-written System Prompt:\n(admin writes expert prompt)"]
        TF5["Pre-written greeting & questions"]
        TF6["Lead rules (Hot/Warm/Cold)"]
        TF7["Recommended voice style"]
    end

    TF --> PUBLISH["Publish Template"]
    PUBLISH --> VISIBLE2["Template visible to all users\nin 'New Employee' creation page"]

    VISIBLE2 --> USER_USES["👤 User sees template\n'Hindi Sales Agent v1'\nClicks '1-Click Deploy'\nAgent created instantly!"]

    ET --> MANAGE_TEMP["Manage existing templates:"]
    MANAGE_TEMP --> MT1["Edit template"]
    MANAGE_TEMP --> MT2["Unpublish template"]
    MANAGE_TEMP --> MT3["See how many users\nhave used this template"]
```

---

## 👑 A6 — ALL CAMPAIGNS MONITOR

```mermaid
flowchart TD
    AC2["📢 All Campaigns Monitor\n(Admin sees every campaign\nfrom every user)"] --> CAMP_LIST2["Campaigns Table:"]

    CAMP_LIST2 --> CAMP_ROW["Each row:\nUser | Campaign Name | Status | Calls | Hot Leads | Started"]

    CAMP_LIST2 --> FILTER3["Filter by:\n• User\n• Status (Running/Paused/Done)\n• Date range"]

    CAMP_LIST2 --> ADMIN_CTRL["Admin Controls per Campaign:"]
    ADMIN_CTRL --> AC_1["⏸ Force pause any campaign\n(if abuse detected)"]
    ADMIN_CTRL --> AC_2["🔍 View full campaign details"]
    ADMIN_CTRL --> AC_3["📊 See live progress"]
```

---

## 👑 A7 — BILLING & PLANS

```mermaid
flowchart TD
    BILL2["💳 Billing & Plans"] --> PLAN_MGT["Plan Management"]
    BILL2 --> REVENUE["Revenue Dashboard"]
    BILL2 --> USER_BILL["Per-User Billing"]

    subgraph PLAN_MGT["Plans Admin Manages"]
        PM1["FREE PLAN\n• 2 employees\n• 100 calls/month\n• 1 number\n• ₹0/month"]
        PM2["STARTER PLAN\n• 10 employees\n• 1,000 calls/month\n• 3 numbers\n• ₹999/month"]
        PM3["PRO PLAN\n• 50 employees\n• 10,000 calls/month\n• 10 numbers\n• ₹4,999/month"]
        PM4["ENTERPRISE\n• Unlimited\n• Custom pricing"]
    end

    subgraph REVENUE["Revenue Dashboard"]
        RV1["Monthly Recurring Revenue: ₹2,84,000"]
        RV2["New subscribers: 12"]
        RV3["Churned: 2"]
        RV4["Revenue chart by month"]
    end

    subgraph USER_BILL["Per-User Billing Actions"]
        UB1["Add credits to user account"]
        UB2["View user's usage this month"]
        UB3["Generate invoice for user"]
        UB4["Upgrade/downgrade user plan"]
        UB5["Set auto top-up rules"]
    end
```

---

## 👑 A8 — SYSTEM SETTINGS

```mermaid
flowchart TD
    SYS["⚙️ System Settings"] --> SS1 & SS2 & SS3 & SS4

    subgraph SS1["API Configuration"]
        APC1["VoBiz Auth ID + Token\n(platform-level key)"]
        APC2["Sarvam AI API Key\n(platform-level)"]
        APC3["Groq API Key\n(platform-level)"]
        APC4["Test all connections button"]
    end

    subgraph SS2["Platform Defaults"]
        PD1["Default language for new employees"]
        PD2["Default call retry rules"]
        PD3["Max call duration globally"]
        PD4["Recording retention: 30 days"]
    end

    subgraph SS3["Webhook Config"]
        WC2["Webhook URL for VoBiz events"]
        WC3["Events: call.ended, recording.ready\ncampaign.completed"]
        WC4["Webhook secret key"]
    end

    subgraph SS4["Email & Notifications"]
        EN1["SMTP settings for emails"]
        EN2["Alert thresholds\n(low balance, high failure rate)"]
        EN3["Admin notification preferences"]
    end
```

---

## 👑 A9 — ALERTS & AUDIT LOGS

```mermaid
flowchart TD
    LOGS["🚨 Alerts & Audit Logs"] --> ALERTS3 & AUDIT

    subgraph ALERTS3["Live Alerts"]
        AL_1["🔴 API down — VoBiz/Sarvam/Groq"]
        AL_2["🟡 User balance below ₹500"]
        AL_3["🔴 Campaign fail rate > 50%"]
        AL_4["🟡 Phone number flagged as spam"]
        AL_5["🔴 Unusual call volume spike"]
    end

    subgraph AUDIT["Audit Log Table"]
        AU1["Every action ever taken\nby admin or user"]
        AU2["Columns:\nTimestamp | User | Action | Details"]
        AU3["Examples:\n'Priya created employee'\n'Admin added ₹1000 credits'\n'Campaign X launched'\n'Number +91XX purchased'"]
        AU4["Filter by user / date / action type"]
        AU5["Export as CSV"]
    end
```

---

---

# ═══════════════════════════════
# 👤 USER PANEL — COMPLETE FLOW
# ═══════════════════════════════

## 🗺️ User Master Navigation

```mermaid
flowchart TD
    USER_HOME["👤 User Dashboard"] --> USECTIONS

    USECTIONS --> US1["📊 Overview"]
    USECTIONS --> US2["📈 Dashboard"]
    USECTIONS --> US3["🤖 My Employees"]
    USECTIONS --> US4["➕ New Employee"]
    USECTIONS --> US5["🔴 Talk to an Employee"]
    USECTIONS --> US6["🎓 Train Employees"]
    USECTIONS --> US7["⚡ Instant Leads"]
    USECTIONS --> US8["📢 Bulk Campaigns"]
    USECTIONS --> US9["📲 Inbound Calls & Setup"]
    USECTIONS --> US10["📋 Leads & Results"]
    USECTIONS --> US11["💬 All Conversations"]
    USECTIONS --> US12["📞 Phone Numbers"]
    USECTIONS --> US13["📈 Performance"]
    USECTIONS --> US14["💳 Billing"]
    USECTIONS --> US15["⚙️ Account Settings"]
```

---

## 👤 U1 — USER LOGIN

```mermaid
flowchart TD
    OPEN2(["User opens app"]) --> LP2["Login Page"]
    LP2 --> EM2["Enter email"]
    EM2 --> PW2["Enter password"]
    PW2 --> SUB2["Click Login"]
    SUB2 --> AUTH2{Valid?}
    AUTH2 -->|Yes| UD["✅ User Dashboard\n(Overview page)"]
    AUTH2 -->|No| ER2["❌ Wrong credentials"]
    ER2 --> LP2
    UD --> SEES2["User sees their own:\n• Employees\n• Campaigns\n• Results\n• Numbers assigned by admin"]
```

---

## 👤 U2 — OVERVIEW + DASHBOARD

```mermaid
flowchart TD
    OV2["📊 Overview Page"] --> MY_STATS

    subgraph MY_STATS["My Stats Today"]
        MS1["🤖 My Active Employees: 3"]
        MS2["📞 Calls Made Today: 247"]
        MS3["🔥 Hot Leads Today: 28"]
        MS4["📢 Campaigns Running: 1"]
        MS5["💰 Credits Remaining: ₹1,840"]
    end

    OV2 --> QUICK_ACTIONS["Quick Action Buttons:"]
    QUICK_ACTIONS --> QA1["⚡ Make Instant Call"]
    QUICK_ACTIONS --> QA2["📢 Start New Campaign"]
    QUICK_ACTIONS --> QA3["➕ Create New Employee"]

    OV2 --> DASH3["📈 Dashboard"]
    DASH3 --> GRAPH1["My calls per day — bar chart"]
    DASH3 --> GRAPH2["Hot vs Warm vs Cold — pie chart"]
    DASH3 --> GRAPH3["Best performing employee"]
    DASH3 --> GRAPH4["Recent conversations list"]
```

---

## 👤 U3 — MY EMPLOYEES (View & Manage)

```mermaid
flowchart TD
    ME2["🤖 My Employees Page"] --> EMP_GRID["Grid of Employee Cards"]

    EMP_GRID --> EMP_CARD["Each Employee Card:"]
    EMP_CARD --> EC1["👤 Name: Priya"]
    EMP_CARD --> EC2["🌐 Language: Hindi"]
    EMP_CARD --> EC3["📞 Number: +91XXXXXXXXXX"]
    EMP_CARD --> EC4["🟢 Status: Active"]
    EMP_CARD --> EC5["📊 147 calls | 18% hot rate"]

    EMP_GRID --> CLICK_CARD["Click an Employee Card"]
    CLICK_CARD --> DETAIL_PANEL["Detail Panel Opens"]

    DETAIL_PANEL --> DP_ACTIONS["Actions:"]
    DP_ACTIONS --> DPA1["🔴 Talk to Employee\n(test call to own phone)"]
    DP_ACTIONS --> DPA2["✏️ Edit / Retrain\n(go to Train page)"]
    DP_ACTIONS --> DPA3["📢 Use in Campaign\n(pre-fill campaign form)"]
    DP_ACTIONS --> DPA4["📋 View Call History\n(calls this agent made)"]
    DP_ACTIONS --> DPA5["📊 View Performance Stats"]
    DP_ACTIONS --> DPA6["⏸ Pause Employee\n(stop making calls)"]
    DP_ACTIONS --> DPA7["▶️ Activate Employee"]
    DP_ACTIONS --> DPA8["🗑️ Delete Employee"]
```

---

## 👤 U4 — NEW EMPLOYEE (Create an AI Agent)

```mermaid
flowchart TD
    NEW2(["User clicks 'New Employee'"]) --> CHOICE["Choose how to create:"]

    CHOICE --> TEMPLATE_WAY["📋 Use a Template\n(admin pre-built templates)"]
    CHOICE --> SCRATCH_WAY["✍️ Create from Scratch"]

    TEMPLATE_WAY --> PICK_TEMP["See available templates:\n• Hindi Sales Agent\n• Tamil Support Agent\n• English Lead Qualifier\n• Telugu Survey Agent"]
    PICK_TEMP --> SELECT_TEMP["Select a template"]
    SELECT_TEMP --> CUSTOMIZE["Edit the template\n(optional — can use as-is)"]
    CUSTOMIZE --> PICK_NUM["Pick Phone Number\nfrom assigned pool"]
    PICK_NUM --> DEPLOY_TEMP["Deploy ✅"]

    SCRATCH_WAY --> STEP_A

    subgraph STEP_A["Step 1 — Name & Language"]
        SA1["Employee Name: 'Priya'"]
        SA2["Select Language:\nHindi / Tamil / Telugu /\nBengali / Marathi / Gujarati /\nKannada / Malayalam / English"]
    end

    STEP_A --> STEP_B

    subgraph STEP_B["Step 2 — Goal & Script"]
        SB1["Select Goal:\n💰 Sales / 🎧 Support /\n🎯 Lead Qualify / 📅 Booking / 📋 Survey"]
        SB2["Opening Greeting:\n'Namaste! Main Priya hoon...'"]
        SB3["Screening Questions:\nQ1: Are you interested?\nQ2: What is your budget?\nQ3: When can we schedule?"]
        SB4["Closing Message:\n'Thank you! We will call back.'"]
    end

    STEP_B --> STEP_C

    subgraph STEP_C["Step 3 — Lead Rules"]
        SC1["🔥 HOT if customer says:\n'yes', 'interested', 'tell me more'"]
        SC2["🟡 WARM if customer:\nasks questions but hesitates"]
        SC3["❄️ COLD if customer says:\n'no', 'not now', 'not interested'"]
    end

    STEP_C --> STEP_D

    subgraph STEP_D["Step 4 — Pick Phone Number"]
        SD1["Admin has assigned numbers\nUser picks one:\n📞 +91 98765 XXXXX\n📞 +91 80012 XXXXX"]
    end

    STEP_D --> STEP_E

    subgraph STEP_E["Step 5 — Test Call"]
        SE1["Enter own phone number"]
        SE2["Click 'Test Now'"]
        SE3["Phone rings — talk to agent"]
        SE4["See transcript after call"]
        SE5["Happy? → Deploy\nNot happy? → Go back & edit"]
    end

    STEP_E --> DEPLOY2["🚀 Click 'Create Employee'"]
    DEPLOY2 --> CREATED["✅ Employee Created!\nNow visible in My Employees"]

    DEPLOY_TEMP --> CREATED
```

---

## 👤 U5 — TALK TO EMPLOYEE (Live Test)

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant APP as VoiceAI Studio
    participant SA as Sarvam AI
    participant PHONE as 📱 User's Phone

    U->>APP: Clicks "Talk to an Employee"
    APP->>U: Modal opens

    U->>APP: Selects employee (e.g. Priya)
    U->>APP: Types own number: +91XXXXXXXXXX
    U->>APP: Clicks "Call Me Now 🔴"

    APP->>SA: POST /outbounds\n{agent_phone, user_phone}
    SA-->>APP: Dialing...

    SA->>PHONE: 📞 Phone rings!
    PHONE-->>SA: User picks up

    SA->>PHONE: 🗣️ Agent speaks greeting
    PHONE->>SA: User talks back

    Note over SA,PHONE: Real-time conversation\n(testing the agent quality)

    PHONE->>SA: User hangs up
    SA-->>APP: Call ended + transcript

    APP->>U: Shows:\n📝 Full transcript\n⏱️ Duration\n🎯 Outcome detected\n"Happy with this employee?"
```

---

## 👤 U6 — TRAIN EMPLOYEES (Update Agent)

```mermaid
flowchart TD
    TRAIN_PAGE2["🎓 Train Employees Page"] --> SELECT2["Select Employee to train\n(dropdown)"]

    SELECT2 --> WHY2["Why am I retraining?"]
    WHY2 --> WR1["Low conversion → fix prompt"]
    WHY2 --> WR2["Agent sounds wrong → fix tone"]
    WHY2 --> WR3["New info to add → update script"]

    WR1 & WR2 & WR3 --> EDIT_FORM

    subgraph EDIT_FORM["Edit Form (same as creation)"]
        EF1["📝 Edit system prompt"]
        EF2["✏️ Change greeting message"]
        EF3["❓ Update questions"]
        EF4["📋 Add/edit FAQ answers\nQ: What is price?\nA: ₹999/month"]
        EF5["🎯 Update Hot/Warm/Cold rules"]
    end

    EDIT_FORM --> TEST_AGAIN2["Test again?\n(Talk to Employee)"]
    TEST_AGAIN2 -->|Yes| LIVE2["Test call to own phone\nVerify changes work"]
    TEST_AGAIN2 -->|No| SAVE2["Click 'Save & Update'"]
    LIVE2 -->|Good| SAVE2
    LIVE2 -->|Still wrong| EDIT_FORM

    SAVE2 --> UPDATED3["✅ Agent updated instantly!\nAll future calls use new training"]
```

---

## 👤 U7 — INSTANT LEADS (Single Call Now)

```mermaid
flowchart TD
    IL["⚡ Instant Leads Page"] --> FORM3["Simple Call Form"]

    FORM3 --> F_A["📞 Contact Phone Number\n+91XXXXXXXXXX"]
    FORM3 --> F_B["🤖 Select Employee\n(which agent calls them)"]
    FORM3 --> F_C["📝 Contact Name (optional)"]
    FORM3 --> F_D["📌 Context (optional)\n'This person asked about Pro plan'"]

    F_A & F_B & F_C & F_D --> CALL_BTN["Click 'CALL NOW 🚀'"]

    CALL_BTN --> STATUS2["Live status tracker:"]
    STATUS2 --> ST_1["🔄 Dialing..."]
    ST_1 --> ST_2["📞 Ringing..."]
    ST_2 --> ST_3["🗣️ In conversation... (timer shows)"]
    ST_3 --> ST_4["✅ Call ended"]

    ST_4 --> OUTCOME2["Outcome Card:"]
    OUTCOME2 --> OC1["🎯 Result: 🔥 HOT LEAD"]
    OUTCOME2 --> OC2["⏱️ Duration: 2m 45s"]
    OUTCOME2 --> OC3["📝 AI Summary:\n'Customer interested in Pro plan,\nwants callback tomorrow'"]
    OUTCOME2 --> OC4["▶️ Play recording"]
    OUTCOME2 --> OC5["📊 Groq analysis score: 87/100"]

    OUTCOME2 --> NEXT_ACTIONS["Next:"]
    NEXT_ACTIONS --> NA1["📞 Call another person"]
    NEXT_ACTIONS --> NA2["📋 View full transcript"]
    NEXT_ACTIONS --> NA3["📅 Schedule callback"]
    NEXT_ACTIONS --> NA4["📤 Export this lead"]
```

---

## 👤 U8 — BULK CAMPAIGNS (Call Hundreds at Once)

```mermaid
flowchart TD
    BC2["📢 Bulk Campaigns Page"] --> CAMP_LIST3["My Campaigns List:\n✅ Completed | 🟢 Running | ⏸ Paused | 📝 Draft"]

    CAMP_LIST3 --> CREATE2["Click '+ New Campaign'"]

    CREATE2 --> W_A

    subgraph W_A["Step 1️⃣ — Campaign Setup"]
        WA1["Campaign Name:\n'October Sales Drive'"]
        WA2["Select AI Employee:\n(who handles all the calls)"]
        WA3["Select Caller ID:\n• Fixed: always one number\n• Pool: rotate multiple numbers\n• Per-contact: from CSV column"]
    end

    W_A --> W_B

    subgraph W_B["Step 2️⃣ — Upload Contacts"]
        WB1["Upload CSV file\n(must have 'to' column\nwith phone numbers)"]
        WB2["System validates:\n✅ 485 valid\n❌ 15 invalid shown"]
        WB3["Status: DRAFT → READY"]
    end

    W_B --> W_C

    subgraph W_C["Step 3️⃣ — Schedule & Rules"]
        WC_1["Start: Now / Scheduled time"]
        WC_2["Timezone: IST / other"]
        WC_3["Retry: Max 3 attempts\n4 hours between retries"]
        WC_4["Max concurrent calls"]
    end

    W_C --> LAUNCH2["🚀 LAUNCH CAMPAIGN"]

    LAUNCH2 --> RUNNING2

    subgraph RUNNING2["Campaign Running 🟢"]
        RN1["Live counters:\n📞 Dialed: 120/500\n✅ Answered: 89\n🔥 Hot: 14 | 🟡 Warm: 42 | ❄️ Cold: 33\n⏳ Remaining: 380"]
        RN2["Live feed:\nwho is being called right now"]
    end

    RUNNING2 --> CTRL2["Controls:"]
    CTRL2 --> CT1["⏸ Pause\n(stops dialing, can resume)"]
    CTRL2 --> CT2["⏹ Stop\n(ends campaign permanently)"]
    CTRL2 --> CT3["➕ Add more contacts\n(upload another CSV)"]

    RUNNING2 --> COMPLETE2["✅ Campaign Complete"]
    COMPLETE2 --> REPORT2["Auto Report:\n• Total: 500 calls\n• Answer rate: 73%\n• Hot leads: 52 (10.4%)\n• Cost per lead: ₹47\n• Best time was: 3-5pm"]
```

---

## 👤 U9 — INBOUND CALLS & SETUP

```mermaid
flowchart TD
    IB2["📲 Inbound Calls & Setup"] --> SEE2["User sees numbers\nassigned by admin"]

    SEE2 --> NUM_CARDS["Number Cards:"]
    NUM_CARDS --> NC1["📞 +91 98765 XXXXX\nStatus: 🔴 OFF\nAssigned to: (none)"]
    NUM_CARDS --> NC2["📞 +91 80012 XXXXX\nStatus: 🟢 ON\nEmployee: Priya"]

    NC1 --> SETUP_IB["Setup Inbound for this number"]
    SETUP_IB --> IB_FORM

    subgraph IB_FORM["Inbound Configuration"]
        IBF1["Select AI Employee\nwho picks up calls"]
        IBF2["Working Hours:\n9am–6pm / 24x7 / Custom"]
        IBF3["After-hours:\nVoicemail / Transfer / Disconnect"]
        IBF4["Language:\nAuto-detect / Fixed language"]
        IBF5["Welcome message:\n'Thank you for calling...'"]
    end

    IB_FORM --> ENABLE2["Click 'Enable Inbound ✅'"]
    ENABLE2 --> LIVE_IB["🟢 Number is LIVE\nAI Employee answers all incoming calls"]

    LIVE_IB --> INCOMING2["Customer dials +91 98765 XXXXX"]
    INCOMING2 --> PICKUP2["AI Employee picks up instantly\nspeaks in configured language"]
    PICKUP2 --> HANDLE2["Handles full conversation\n(support / booking / qualify)"]
    HANDLE2 --> LOGGED2["Auto-logged in\n'All Conversations'"]

    NC2 --> TOGGLE2["User can Toggle OFF\nif needed"]
```

---

## 👤 U10 — LEADS & RESULTS

```mermaid
flowchart TD
    LR2["📋 Leads & Results"] --> FILTER4["Filter Bar"]

    FILTER4 --> FB_A["By Campaign:\n'October Sales Drive'"]
    FILTER4 --> FB_B["By Date:\nToday / This Week / Custom"]
    FILTER4 --> FB_C["By Outcome:\n🔥 Hot / 🟡 Warm / ❄️ Cold / 📵 No Answer"]
    FILTER4 --> FB_D["By Employee:\nPriya / Ravi / Ananya"]

    FILTER4 --> TABLE4["Results Table"]

    TABLE4 --> R_ROW["Each Row:"]
    R_ROW --> RR1["📞 +91 98765 XXXXX"]
    R_ROW --> RR2["👤 John / (Unknown)"]
    R_ROW --> RR3["🎯 🔥 HOT LEAD"]
    R_ROW --> RR4["⏱️ 2m 45s"]
    R_ROW --> RR5["🤖 Priya (Hindi)"]
    R_ROW --> RR6["📝 'Interested in Pro plan'"]
    R_ROW --> RR7["▶️ Play recording"]

    R_ROW --> ROW_CLICK["Click row → Detail opens"]
    ROW_CLICK --> RD1["▶️ Full recording player"]
    ROW_CLICK --> RD2["📝 Complete transcript"]
    ROW_CLICK --> RD3["📊 Groq analysis:\nSentiment / Intent / Topics"]
    ROW_CLICK --> RD4["✏️ Add manual note"]
    ROW_CLICK --> RD5["🏷️ Change outcome tag"]
    ROW_CLICK --> RD6["📅 Schedule callback"]

    TABLE4 --> EXPORT3["📥 Export CSV\n(all filtered results)"]
```

---

## 👤 U11 — ALL CONVERSATIONS

```mermaid
flowchart TD
    AC3["💬 All Conversations"] --> CONV_LIST2["List: every call ever made\nNewest first"]

    CONV_LIST2 --> SEARCH3["🔍 Search by:\nPhone number / keyword in transcript"]

    CONV_LIST2 --> CONV_CLICK2["Click any conversation"]

    CONV_CLICK2 --> CONV_VIEW

    subgraph CONV_VIEW["Conversation View"]
        CV1["📋 Metadata:\nEmployee | Date | Duration | Language | Outcome"]
        CV2["▶️ Recording Player:\n[▶ ━━━━━━━━━━━━━] 2:45\n⬇️ Download MP3"]
        CV3["📝 Transcript:\n(color coded)\nPriya 🔵: 'Namaste...'\nCustomer ⚪: 'Haan bolo'\nPriya 🔵: 'Kya aap...'\nCustomer ⚪: 'Interested hoon'"]
        CV4["📊 Groq AI Analysis:\n😊 Sentiment: Positive (78%)\n🎯 Intent: Purchase (87%)\n⚠️ Objections: Price concern\n✅ Actions: Send brochure, callback\n🔮 Conversion: 72% likely"]
    end

    CONV_VIEW --> NOTE2["✏️ User adds note\n'Called back — meeting set'"]
    CONV_VIEW --> TAG["🏷️ Change tag:\nHot / Warm / Cold / Converted / Lost"]
```

---

## 👤 U12 — PHONE NUMBERS (User View)

```mermaid
flowchart TD
    PN3["📞 Phone Numbers\n(User sees numbers assigned by admin)"] --> MY_NUMS["My Assigned Numbers:"]

    MY_NUMS --> N_CARD["Each Number Card:"]
    N_CARD --> NC_A["📞 +91 98765 XXXXX"]
    N_CARD --> NC_B["Status: 🟢 Active"]
    N_CARD --> NC_C["Used by: Priya (employee)"]
    N_CARD --> NC_D["Inbound: ON / OFF toggle"]
    N_CARD --> NC_E["Calls today: 47"]
    N_CARD --> NC_F["Answer rate: 71%"]

    MY_NUMS --> ACTIONS6["Actions per number:"]
    ACTIONS6 --> ACT_1["Assign to a different employee"]
    ACTIONS6 --> ACT_2["Toggle inbound ON/OFF"]
    ACTIONS6 --> ACT_3["View call history for this number"]
```

---

## 👤 U13 — PERFORMANCE

```mermaid
flowchart TD
    PERF2["📈 Performance"] --> DATE2["Date filter:\nToday / Week / Month / Custom"]

    DATE2 --> CARDS2

    subgraph CARDS2["My Stats"]
        PC1["📞 Total Calls: 1,247"]
        PC2["✅ Answer Rate: 68%"]
        PC3["⏱️ Avg Duration: 2m 18s"]
        PC4["🔥 Hot Leads: 124 (10%)"]
        PC5["💰 Cost per Hot Lead: ₹45"]
    end

    DATE2 --> BY_EMP2

    subgraph BY_EMP2["By AI Employee"]
        BE_A["Priya (Hindi): 489 calls | 15% hot"]
        BE_B["Ravi (Tamil): 312 calls | 12% hot"]
        BE_C["Ananya (Telugu): 198 calls | 19% hot ⭐"]
    end

    DATE2 --> BY_CAMP2

    subgraph BY_CAMP2["By Campaign"]
        BCA["October Drive:\n500 contacts | 73% answered\n10.4% hot | ₹2,450 spent"]
    end

    DATE2 --> HEATMAP["🕐 Best Time to Call:\nHeatmap — day vs hour\nBest: Tue-Thu 3-5pm ✅\nWorst: Mon 9-10am ❌"]
```

---

## 👤 U14 — BILLING

```mermaid
flowchart TD
    BILL3["💳 Billing"] --> BAL2["💰 My Balance: ₹1,840"]
    BAL2 --> LOW2{Below ₹500?}
    LOW2 -->|Yes| LOW_WARN["⚠️ Low balance warning\nTop up now!"]
    LOW2 -->|No| FINE2["Balance healthy ✅"]

    BILL3 --> USAGE2["📊 This Month:"]
    USAGE2 --> U_A["Minutes used: 2,890 min"]
    USAGE2 --> U_B["Calls made: 1,247"]
    USAGE2 --> U_C["Numbers active: 2"]
    USAGE2 --> U_D["Estimated bill: ₹2,140"]

    BILL3 --> TOPUP2["➕ Add Credits"]
    TOPUP2 --> AMT["₹500 / ₹1000 / ₹5000 / Custom"]
    AMT --> PAY["Payment gateway\n(Razorpay)"]
    PAY --> DONE4["✅ Credits added\nInvoice emailed"]

    BILL3 --> HISTORY2["📄 Transaction History:\nDate | Amount | Reason | Balance"]
    BILL3 --> INVOICE2["🧾 Download Invoice PDF"]
```

---

## 👤 U15 — ACCOUNT SETTINGS

```mermaid
flowchart TD
    SETTINGS2["⚙️ Account Settings"] --> TABS2

    TABS2 --> T_A & T_B & T_C

    subgraph T_A["Profile Tab"]
        TA1["My Name"]
        TA2["Email"]
        TA3["Phone number"]
        TA4["Company name"]
        TA5["Change password"]
        TA6["Upload profile photo"]
    end

    subgraph T_B["Notifications Tab"]
        TB1["Email me when:\n✅ Campaign completes\n✅ Hot lead detected\n✅ Balance below ₹500"]
        TB2["WhatsApp alerts:\n(for hot leads only)"]
        TB3["Alert threshold settings"]
    end

    subgraph T_C["My Plan Tab"]
        TC1["Current plan: PRO"]
        TC2["Employees used: 3 / 50"]
        TC3["Calls this month: 1,247 / 10,000"]
        TC4["Numbers: 2 / 10"]
        TC5["Upgrade plan button"]
    end
```

---

# 🔄 ADMIN vs USER — SIDE BY SIDE COMPLETE COMPARISON

```mermaid
graph TB
    subgraph ADMIN2["👑 ADMIN CONTROLS"]
        AD_1["✅ Create & manage ALL users"]
        AD_2["✅ Buy phone numbers (bulk)"]
        AD_3["✅ Assign numbers to users"]
        AD_4["✅ Create employee templates"]
        AD_5["✅ Monitor ALL campaigns"]
        AD_6["✅ See ALL conversations"]
        AD_7["✅ Manage billing & plans"]
        AD_8["✅ Set API keys (platform-level)"]
        AD_9["✅ View platform analytics"]
        AD_10["✅ Alerts & audit logs"]
        AD_11["✅ Suspend / delete users"]
        AD_12["✅ Add credits to any user"]
    end

    subgraph USER2["👤 USER CONTROLS"]
        US_1["✅ Login & view own dashboard"]
        US_2["✅ Create own AI employees"]
        US_3["✅ Train / update own employees"]
        US_4["✅ Talk to employee (live test)"]
        US_5["✅ Make instant single calls"]
        US_6["✅ Create & run bulk campaigns"]
        US_7["✅ Setup inbound call handling"]
        US_8["✅ View own leads & results"]
        US_9["✅ Read own conversations"]
        US_10["✅ Check own performance"]
        US_11["✅ Manage own billing"]
        US_12["✅ Update own profile"]
    end
```

---

# 🔄 THE COMPLETE END-TO-END FLOW

```mermaid
sequenceDiagram
    actor A as 👑 Admin
    actor U as 👤 User
    participant APP as VoiceAI Studio
    participant VB as VoBiz
    participant SA as Sarvam AI
    participant GQ as Groq

    Note over A,APP: Admin sets up the platform
    A->>APP: Creates user account
    A->>APP: Buys phone numbers from VoBiz pool
    A->>VB: POST /AvailableNumber/ (purchases)
    A->>APP: Assigns numbers to user
    A->>APP: Sets Pro plan (50 employees, 10k calls)

    Note over U,APP: User logs in and works
    U->>APP: Login ✅
    U->>APP: Creates "Priya" AI Employee
    APP->>SA: POST /deployments (create agent)
    SA-->>APP: deployment_id + connection_id
    U->>APP: Tests Priya (Talk to Employee)
    APP->>SA: POST /outbounds (test call)
    SA->>U: 📞 Calls user's phone
    U->>APP: Priya sounds good! Save.

    Note over U,APP: User runs a campaign
    U->>APP: Creates Bulk Campaign
    U->>APP: Uploads 500 contacts CSV
    U->>APP: Launches campaign
    APP->>VB: POST /campaign/start
    VB->>SA: Each answered call routed to Priya
    SA->>SA: Priya handles conversations
    VB->>APP: Webhooks: recording.ready

    Note over U,GQ: User reviews results
    U->>APP: Opens All Conversations
    APP->>GQ: Sends recording to Whisper
    GQ-->>APP: Full transcript
    APP->>GQ: LLaMA analyzes transcript
    GQ-->>APP: Sentiment, intent, score
    APP->>U: Shows complete call intelligence

    Note over A,APP: Admin monitors everything
    A->>APP: Checks platform dashboard
    A->>APP: Sees user's 500 calls completed
    A->>APP: Reviews revenue this month
```
