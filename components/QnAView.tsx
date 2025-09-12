
import React, { useRef } from 'react';
import { X } from 'lucide-react';

const qnaData = [
  {
    id: 'q1',
    title: 'Who is the principal owner and central figure of the Reserveben Group, and what significant titles does he hold?',
    content: `
        <p>The central figure and principal owner of the Reserveben Group is HE Dato' Mohamad Zahari Hj. Awang. His influence is pervasive throughout the organization, as he is identified as the principal owner of the Reserveben Trademark, which covers Monetary Affairs & Financial Affairs (TM2021032098, Clause 36). His esteemed position is underscored by a multitude of significant titles, including Prince of State Nation of Hawaii and Sovereign World of Nations, a title bestowed upon him on November 25, 2024.</p>
        <p>HE Dato' Mohamad Zahari Hj. Awang is the central figure and principal owner of the Reserveben Group, holding principal ownership of its Monetary & Financial Affairs trademark (TM2021032098, Clause 36). His authority is underscored by multiple significant titles:</p>
        <ol>
          <li><strong>Sovereign Titles:</strong> Prince of State Nation of Hawaii and Sovereign World of Nations (bestowed Nov 25, 2024).</li>
          <li><strong>Professional/Economic Titles:</strong> "Mujaddid Ekonomi" (Economic Reformer); Global Monetary Innovator & Designer; Group Asset Chancellor (overseeing 3 thousand 436 Companies Limited); Chancellor, Economic & Monetary Advisor to the President of Nation of Hawaii.</li>
          <li><strong>Spiritual Titles:</strong> Sayyid Dato' Paduka Agung (SADAPA’A - reportedly conferred by Wali Kutub Sheikh Abdul Qadir Al-Jailani under Divine Protocol); lineage connection to King Solomon. He prefers to be called as "TOK KENALAN".</li>
          <li><strong>International Recognition:</strong> Under the authority of Judge PIJAO-INRI Morris, he has received significant recognition as follows:
            <ul>
              <li>Peace Ambassador of the ECOSOC, United Nations (LV-93-LOI 71C)</li>
              <li>Full Diplomatic Immunity (No: QN 003300 No: 11709)</li>
              <li>International Certificate (No: A 0202505 2201, Serial A0-6027, ID No: QN 6058)</li>
              <li>Linked references: United Nations No: 515 705; World Bank No: 01-0A; Mission Order No: 0-035; Public Law No: 107-56; Code No: 010-22-74-OA; World Court No: 01-OA (citing Treaty of Perpetual Treaty of Paris 1868).</li>
            </ul>
          </li>
        </ol>
      `,
  },
  {
    id: 'q2',
    title: 'What is Blue Sky Thinking?',
    content: `<p>"Blue Sky Thinking" is the core philosophy guiding the Reserveben Group's approach to problem-solving and economic solutions. This method, championed by the founder, HE Dato' Mohamad Zahari Hj. Awang, is characterized by its combination of common sense with creative ideation, enabling the identification of extraordinary solutions within everyday contexts and their articulation in a straightforward manner. The ultimate aim of this philosophy is to devise and implement solutions that foster happiness for all individuals. This philosophical underpinning emphasizes an innovative and humanitarian-centric approach to economic development, signaling a departure from conventional, and potentially restrictive, modes of thought. The Living Smile Program, for instance, is created under this Blue-Sky Thinking concept.</p>`,
  },
  {
    id: 'q3',
    title: 'What is the "Sufi Economy - Laduni & Maarifat Economy" concept, and how does it relate to HE Dato\' Mohamad Zahari Hj. Awang\'s role?',
    content: `
            <p>The concept of "Sufi Economy - Laduni & Maarifat Economy" is deeply intertwined with HE Dato' Mohamad Zahari Hj. Awang's persona and role within the Reserveben Group. He is described as a "Sufi Ekonomi," a designation that aligns with his other titles such as "TOK KENALAN" and "SADAPA’A." This economic philosophy is rooted in spiritual insight and knowledge, proposing an approach to wealth creation and distribution that transcends conventional physical transactions.1</p>
            <p>Specifically, the "Sufi Economy" advocates for "trading based on SPIRIT to Physical beings" as a transformative alternative to what is termed "SOUL & BODY Business." The latter is deemed to have failed due to its entanglement with the Riba (Interest) system. This perspective suggests a reliance on intuitive or mystical understanding in economic endeavors, aiming to foster prosperity through principles that are not solely material or profit-driven. It underscores a spiritual dimension to the Group's economic philosophy, implying a profound, almost intuitive, comprehension of wealth generation and its equitable allocation.</p>
        `,
  },
  {
      id: 'q4',
      title: 'What is KORAN & QORAN, and what is their significance in recognizing HE Dato\' Mohamad Zahari Hj. Awang\'s global status?',
      content: `<p>"KORAN" is defined as King of Recognized Assets of All Nations and "QORAN" is defined as "Queen of Recognized Assets of All Nations." These terms are associated with the recognition and global immunity granted to HE Dato' Mohamad Zahari Hj. Awang. Under the authority of Judge PIJAO-INRI Morris, who is also known by these codenames, HE Dato' Mohamad Zahari Hj. Awang has been bestowed with significant international recognition, including the title of Peace Ambassador of the ECOSOC of United Nations (under LV-93-LOI 71C) and full Diplomatic Immunity (No: QN 003300 No: 11709). This recognition is further supported by an International Certificate (No: A 0202505 2201, Serial A0-6027, ID No: QN 6058), and is linked to United Nations No: 515 705, World Bank No: 01-0A, Mission Order No: 0-035, Public Law No: 107-56, Code No: 010-22-74-OA, and World Court No: 01-OA, referencing the Treaty of Perpetual Treaty of Paris 1868. These designations signify a framework of natural law and diplomatic immunity, reinforcing the authority and global mission of the Prince of State.</p>`,
  },
  {
      id: 'q5',
      title: 'What are the 8 core characteristics expected from members of the DZA Group?',
      content: `<p>The founder and principal figure of the DZA Group, HE Dato' Mohamad Zahari Hj. Awang, emphasizes a set of core characteristics essential for all members to embody in their contributions to the Group's ambitious mission. These expected qualities are: BRILLIANT – INTELLIGENCE – MATURED – SMART– CREATIVE – INITIATIVE– MENTALITY – SENSITIVE (BIMS & MICS).
 HE Dato' Mohamad Zahari Hj. Awang believes that cultivating these attributes among DZA Group members is crucial for fostering an environment of innovation, strategic problem-solving, and effective implementation of the Earth Economic Solution. By demonstrating Brilliance and Intelligence, members can contribute to the conceptualization of complex solutions. Maturity and Smartness are vital for guiding practical execution. Possessing the right Mentality ensures resilience, adaptability, and a solution-focused mindset necessary to navigate challenges and sustain long-term vision. Creativity and Initiative drive the pioneering of new economic models. Furthermore, a Sensitive approach ensures that the Group's humanitarian objectives and global economic transformation efforts are carried out with empathy and a focus on the well-being of all individuals. These characteristics are seen as fundamental to aligning individual efforts with the founder's visionary leadership and the Group's overarching goals.</p>`,
  },
  {
      id: 'q6',
      title: 'What is the "Iron Corridor Economy" concept, its structure, and its global reach?',
      content: `
          <p>The Iron Corridor Economy is Reserveben Group’s "Global Pillar economic" framework designed to:</p>
          <ol>
              <li>Address global economic deficits (Non-Performing Loans/NPL, Domestic Direct Investment/DDI).</li>
              <li>Meet Foreign Direct Investment (FDI) requirements.</li>
              <li>Sustain and elevate national GDP levels.</li>
          </ol>
          <p><strong>Structure:</strong></p>
          <ul>
              <li>Initial Scale: 3,436 legally registered "Company Limited" entities in Thailand (chosen for its non-colonial history).</li>
              <li>Future Scale: Expansion planned to 45,000 companies.</li>
              <li>Funding: Private Investment Program generating returns allocated as:
                  <ul>
                      <li>0%: Overhead (salaries, allowances).</li>
                      <li>45%: FDI via collateralization (using Foreign Exchange Reserve Balance) for economically pressured nations.</li>
                      <li>45%: Reserveben Reserve for:
                          <ul>
                              <li>NPL resolution.</li>
                              <li>Humanitarian Disaster Grants (volcanic eruptions, floods, tsunamis, wildfires, war victims) covering immediate aid and post-disaster essentials (food, clothing, education, health).</li>
                          </ul>
                      </li>
                  </ul>
              </li>
          </ul>
          <p><strong>Global Reach & Symbolism:</strong></p>
          <ul>
              <li>Companies are named after: countries, natural elements (trees, oceans, mountains, rivers, lakes, hills, islands, bays, planets), cities, airports, animals, marine life.</li>
              <li>Aims to establish a decentralized global network operating outside traditional regulatory frameworks.</li>
          </ul>
      `,
  },
  {
      id: 'q7',
      title: 'What is the Reserveben Group, what is the origin and meaning of its name, and what is the hierarchical structure of the Reserveben Group\'s parent companies, GUTO & World Nations?',
      content: `
          <p>The Reserveben Group is a global economic entity.</p>
          <ul>
              <li><strong>Name Origin:</strong> Portmanteau of "Reserve" (Simpanan = savings/reserve fund) + "Beneficiary" (Pewaris = heir/inheritor). This reflects its role as a catalyst for the Sovereign Wealth Fund.</li>
          </ul>
          <p><strong>Hierarchical Structure:</strong></p>
          <ol>
              <li>Top Parent:
                  <ul>
                      <li>Reserveben (Ariyal) Co. Ltd. - Overarching financial parent company sheltering the entire group.</li>
                  </ul>
              </li>
              <li>Primary Parent Companies (sheltered by Ariyal):
                  <ul>
                      <li>Reserveben (World Nations) Co. Ltd. (Company No: 08355670376):
                          <ul>
                              <li>Manages cooperation/diplomatic relations with Government-Linked Companies (GLCs).</li>
                              <li>Facilitates Diplomatic & Monetary Settlement (fund injection via time deposits for NPL, FDI/DDI to impact GDP & per capita income).</li>
                          </ul>
                      </li>
                      <li>Reserveben (Global United Team Organization - GUTO) Co. Ltd. (Company No: 0835567037, Phuket, Thailand):
                          <ul>
                              <li>Provides financial solutions to countries with named "Co. Ltd." entities.</li>
                              <li>Addresses Banking Deficit Balance (NPL).</li>
                              <li>Manages Foreign Exchange Reserve Balance (collateral for local/new currency based on World recognized currency for FDI/DDI).</li>
                              <li>Provides Humanitarian Disaster Grants.</li>
                          </ul>
                      </li>
                  </ul>
              </li>
          </ol>
      `,
  },
  {
      id: 'q8',
      title: 'What is Global United Team Organization (GUTO), when and where was it registered, and what are its primary tasks and roles?',
      content: `
          <p>Global United Team Organization (GUTO) is a Company Limited:</p>
          <ul>
              <li>Registered as: RESERVEBEN (GUTO) CO. LTD.</li>
              <li>Company No: 0835567037</li>
              <li>Location/Date: Phuket, Thailand (registered October 22, 2024; chosen due to Thailand’s non-colonial history).</li>
          </ul>
          <p><strong>Primary Tasks:</strong></p>
          <ol>
              <li>Financial Solutions: Provide support to allied "Co. Ltd." entities globally.</li>
              <li>Banking Deficit Balance: Address Non-Performing Loans (NPLs).</li>
              <li>Currency Stability:
                  <ul>
                      <li>Stabilize Foreign Exchange Reserves via central bank deposits.</li>
                      <li>Use deposits as collateral for local currencies and new currencies (backed by World recognized currency) for FDI/DDI.</li>
                  </ul>
              </li>
              <li>Humanitarian Aid: Provide Humanitarian Disaster Grants:
                  <ul>
                      <li>Economic Obligation: Direct financial aid during disasters.</li>
                      <li>Social Obligation: Post-disaster essentials (food, clothing, health, education).</li>
                  </ul>
              </li>
          </ol>
      `,
  },
  {
      id: 'q9',
      title: 'What is the DZA Banking Group, and what licensed entities does it comprise?',
      content: `
          <p>The DZA Banking Group serves as a crucial financial component within the broader Reserveben Group. It comprises four distinct licensed banking entities, all of which received approval from the Nation of Hawaii Central Bank on September , 2023, for a 0-year tenure. These licensed banks are:</p>
          <ul>
              <li>DZA Commercial Bank Inc. (NOHSRB9400)</li>
              <li>DZA Investment Bank Inc. (NOHSRB9700)</li>
              <li>DZA Quantum Digital Bank Inc. (NOHSRB9600)</li>
              <li>DZA International Offshore Bank Inc. (NOHSRB9800).</li>
          </ul>
          <p>The establishment and operation of these banks are significantly supported by substantial gold-backed assets. HE Dato' Mohamad Zahari Hj. Awang personally assigned 350 Metric Tons of Aurum Utalium (Gold Bar) to the Central Bank Nation of Hawaii. This gold collateral was valued at USD 22,656,258,576.00 as of April 2, 2022, based on the London Metal Exchange Rate (LMER). This backing underscores the financial credibility and operational capacity of the DZA Banking Group and highlights its direct connection to the Nation of Hawaii's central banking system.</p>
      `,
  },
  {
      id: 'q10',
      title: 'How are the "Magic 7" ASEAN countries involved in the initial implementation of the Earth Economic Solution?',
      content: `
          <p>The "Magic 7" economic zone within ASEAN plays a pivotal role in the initial implementation phase of the Earth Economic Solution (EES). This strategic regional focus indicates a phased approach to the Reserveben Group's global economic transformation. The "Magic 7" countries include Thailand, Cambodia, Malaysia, Singapore, Indonesia, Brunei Darussalam, and the Philippines.</p>
          <p>For each of these nations, a specific mechanism has been established: they have been formally registered as a "Legitimate Body," taking the form of a "Company Limited." Furthermore, a President Ambassador has been appointed for each, who receives a 3% free share in the respective company. This share entitles them to annual investment return bonuses, thereby providing a direct mechanism for local engagement and benefit-sharing within the framework of the EES. This approach aims to ensure regional buy-in and provides a structured method for integrating these economies into the broader initiative.</p>
      `,
  },
  {
      id: 'q11',
      title: 'What is the Earth Economic Solution (EES) Committee (also known as AL MUTAWAKIL COMMITTEE), what is its purpose, who chairs it, what is its composition, and what are its key departments and their areas of focus?',
      content: `
          <p>The Earth Economic Solution (EES) Committee / AL MUTAWAKIL COMMITTEE serves as the dedicated implementation arm within the Reserveben Group framework. It was formally established under the directive of the Prince of State (DZA) to address systemic global economic distress.</p>
          <p><strong>Core Purpose & Mission:</strong></p>
          <ul>
              <li>To design and execute interest-free ("riba-free") economic solutions specifically targeting nations struggling under significant sovereign debt burdens, with particular emphasis on obligations owed to international financial institutions like the International Monetary Fund (IMF).</li>
              <li>The initial operational focus is strategically centered on the seven key ASEAN economies designated as the "Magic 7," forming the pilot phase for broader global application of its solutions.</li>
          </ul>
          <p><strong>Leadership & Composition:</strong></p>
          <ul>
              <li>Chairmanship: The Committee is led by a professionally appointed Chairperson responsible for steering its strategic direction and operations.</li>
              <li>Membership: Comprised exclusively of top-tier professional experts selected for their specialized knowledge and experience in global finance, economics, and development. This ensures the Committee possesses the necessary capability to tackle complex international debt and economic restructuring challenges.</li>
          </ul>
          <p><strong>Organizational Structure & Key Functions:</strong></p>
          <ul>
              <li>The AL-MUTAWAKIL COMMITTEE operates through a structured framework of specialized departments.</li>
              <li>Each department is headed by a professional lead and focuses on distinct critical areas essential to delivering the Earth Economic Solution.</li>
              <li>This departmentalization allows for targeted expertise in addressing the multifaceted aspects of global economic recovery, debt resolution, and sustainable development, translating the Committee's Riba-free (Un-Usury) principles into actionable programs.</li>
          </ul>
          <p>of the committee's work in addressing multifaceted global challenges.</p>
          <p>The key departments and their areas of focus include:</p>
          <ul class="list-disc list-inside">
              <li>President and Chancellor</li><li>General Secretary Department</li><li>DZA Investment Bank Inc.</li><li>DZA Quantum Digital Bank Inc.</li><li>Natural Disaster Relief Department</li><li>Foreign Direct Investment (FDI) Department</li><li>Non-Performing Loan (NPL) Department</li><li>Stock Exchange Department</li><li>Public Ltd Co.  & Government Linked Co. Department</li><li>Publicity, Promotion & Media Department</li><li>Artificial Intelligence Expertise Department</li><li>National Education Department</li><li>Habitat Humanity (HH) Department</li><li>Legal Division Department</li><li>Legal & Compliance - Company Ltd Secretariat Department</li><li>National Economy Development Program (NEDP) Department</li><li>Entire Nation Retirement (Police) / NGO Department</li><li>DZA Foundation Group Department</li><li>Costing Department</li><li>Logistics Department</li><li>Internal Audit Department</li>
          </ul>
      `,
  },
  {
      id: 'q12',
      title: 'What is the Living Smile program?',
      content: `
          <p>The Living Smile Program is a concept under the "Blue-Sky Thinking" initiative, created by HE Dato' Mohamad Zahari Hj. Awang (SADAPA'A' @ TOK KENALAN @DZA-Global Monetary Innovator & Designer). Its primary aim is to establish 85 regions/territories within the Malay Peninsula, encompassing Malaysianese-Malaysia, Chinese-Malaysia, and Kelantanese areas.</p>
          <p>The Living Smile Program, through the Reserveben® platform, aims to generate Foreign Direct Investment (FDI) and Local Domestic Direct Investment (DDI) to boost the Local Gross Domestic Product (GDP) towards per capita income, ensuring local residents earn at least MYR 7,000 per month. These 85 company platforms are part of a larger blueprint to create 3,422 similar platforms worldwide, applying the same concept, system, and formula across all countries and sovereign regions.</p>
          <p>Beyond economic aspects, the program also prioritizes "Education Affairs" and "Health Affairs," aiming to improve the quality of knowledge among the nation's youth and address health concerns.</p>
      `,
  },
  {
      id: 'q13',
      title: 'What is HH?',
      content: `
          <p>HH stands for "One Habitat One Humanity," and it is a significant initiative within the Reserveben Group's broader humanitarian and development goals. It is specifically a department within the AL-MUTAWAKIL COMMITTEE (EES Committee) focused on providing shelter solutions.</p>
          <p>This program, under the leadership of HE Dato' Mohamad Zahari Hj. Awang (Sadapa'a), aims to build a substantial number of "high medium-cost Free Shelters" across the "ASIA MAGIC" continent, which comprises 53 countries and 1,078 sovereign territories or states An allocation of USTN 0.7 Trillion is designated for this purpose, with plans to build 5,455 units per platform, totaling approximately 5,580,470 units across the continent, amounting to an allocation of USTN 0.34 Trillion. This initiative is projected to provide shelter for around 79,902,350 people (based on an average of 5 occupants per family unit).</p>
          <p>The program also involves 33 sub-main contractors, comprising companies led by partisans and NGOs in Malaysia and overseas, to facilitate the budget distribution and attract Foreign Direct Investment (FDI). Furthermore, the Reserveben (World Nations) and Global United Team Organization (GUTO) are expected to play an important role in building 45,000 shelters/homes for the people of Hawaii through the Prince of State Chamber Charity.</p>
      `,
  },
  {
      id: 'q14',
      title: 'What are the key long-term goals of the Reserveben Group concerning global economic transformation?',
      content: `
          <p>The Reserveben Group aims to fundamentally restructure the global economy through these core objectives:</p>
          <ol>
              <li>Eliminate National Debt.</li>
              <li>Stabilize Economies
                  <ul>
                      <li>Strengthen local currencies via Foreign Exchange Reserve collateral.</li>
                      <li>Boost GDP & per capita income through FDI/DDI support.</li>
                  </ul>
              </li>
              <li>Deploy Quantum Financial System (QFS): Implement a riba-free financial backbone for asset security, data secrecy, and satellite monitoring.</li>
              <li>Build the "Iron Corridor Economy": Create 3,436 (scaling to 45,000) Thailand-registered "Company Limited" entities named after global elements. These address NPLs & FDI deficits.</li>
              <li>Provide Universal Basic Income (UBI)</li>
              <li>Launch ASEAN RIYAL (ARIYAL): Introduce a gold-backed world currency (via Sovereign Wealth Fund & Prince of State Chamber Charity) symbolizing Asian recovery, beauty, and peace.</li>
              <li>Support Hawaiian Sovereignty: Achieve Full Independence for the Nation of Hawaii by 2027, including building 45,000 shelters/homes via the Prince of State Chamber Charity.</li>
              <li>Global Empowerment: Restructure economies and uplift disadvantaged populations through education, training, and industry opportunities.</li>
          </ol>
          <p>These goals represent a systemic challenge to existing financial structures, aiming for a complete economic paradigm shift.</p>
      `,
  },
  {
      id: 'q15',
      title: 'What is the Reserveben Group\'s stance on "Sovereign Wealth" and its historical manipulation?',
      content: `
          <p>The Reserveben Group operates under the conviction that the Earth's inherent sovereign wealth has been systematically manipulated over the past 500 years. This manipulation is attributed to entities described as "followers of AZAZIL @LUCIFER," implying a historical and almost conspiratorial narrative behind global economic disparities. The core objective of the initiative is to reclaim and restore this intrinsic wealth to the global population.</p>
          <p>This restoration is envisioned to be achieved through the "Pemulihan dan Penebusan Historical Asset dan Numismatic Asset" (Recovery and Redemption of Historical and Numismatic Assets). This framing positions the Group's efforts as a rectification of historical injustices and a re-establishment of a natural, equitable economic order. The narrative provides a powerful underlying motivation for the group's ambitious global economic transformation agenda.</p>
      `,
  },
  {
      id: 'q16',
      title: 'What is the core philosophy guiding the Reserveben Group\'s approach to problem-solving and economic solutions?',
      content: `<p>The Reserveben Group operates under a core philosophy termed "Blue Sky Thinking." This approach is characterized by its combination of common sense with creative ideation, enabling the identification of extraordinary solutions within everyday contexts and their articulation in a straightforward manner. The ultimate aim of this philosophy is to devise and implement solutions that foster happiness for all individuals. This philosophical underpinning emphasizes an innovative and humanitarian-centric approach to economic development, signaling a departure from conventional, and potentially restrictive, modes of thought.</p>`,
  },
  {
      id: 'q17',
      title: 'What is the concept of the "Non-Riba Economy" and its significance to the Reserveben Group\'s mission?',
      content: `
          <p>The "Non-Riba Economy," also referred to as the "Un-Ribawi Economy”, ”Un-Usury Economy," constitutes a foundational tenet of the Reserveben Group's mission. This concept is centered on the eradication of the "Riba" (interest-based) financial system, which the group asserts has been a tool of manipulation by global elites. The initiative explicitly references religious principles, citing Al-Quran Surah AL-BAQARAH verses 275-279, which prohibit the practice of Riba, as the basis for its economic model.</p>
          <p>The implementation of this Un-Ribawi / Un-Usury Economy is a central component of the "Earth Economic Solutions (EES)" promoted by the group. It is projected that the adoption of this Non-Riba Financial System will significantly contribute to the economic prosperity of Southeast Asia. This commitment to a non-interest-based system positions the Reserveben Group's financial model as a profound ideological and religious alternative to the prevailing global financial system.</p>
          <p>The explicit rejection of "Riba" based on religious texts and the assertion that the current system is a "manipulation by global elites" (identified as AZAZIL @LUCIFER, G7, and the World Economy Forum (WEF)) represent a fundamental ideological challenge to the established global financial order. This is presented not merely as a business model but as a socio-economic and potentially spiritual revolution. The claim that "SOUL & BODY Business" has "failed" due to Riba suggests a deep critique of contemporary capitalism. By proposing an "Un-Ribawi / Un-Usury Economy" and emphasizing "trading based on SPIRIT to Physical beings," the Reserveben Group positions itself as a moral and ethical alternative. This approach seeks to restore "Sovereign Wealth" that is believed to have been "manipulated for 500 years." This strong ideological stance is designed to attract a specific segment of the global population and provides a compelling narrative for its ambitious goals, potentially appealing to those disillusioned with conventional finance.</p>
      `,
  },
  {
      id: 'q18',
      title: 'What is ASEAN Riyal (ARIYAL) currency, its backing, security features, and symbolic significance?',
      content: `<p>The ASEAN Riyal (ARIYAL) is a new world currency designed as a "symbol of recovery, beauty, and economic strength" for Asia. It functions as both legal tender and a "masterpiece of design and diplomacy," fully backed by gold from the Sovereign Wealth Fund and development wealth of the Prince of State Chamber Charity.</p>`,
  },
  {
      id: 'q19',
      title: 'What is "Time Deposit Mechanism" for national central banks?',
      content: `
          <p>The "Time Deposit Mechanism" represents a direct and practical application of the "Non-Riba" principle within national banking systems, offering interest-free capital for economic development. Under this mechanism, a substantial sum of cash deposits will be placed as a Time Deposit in the central banks of various nations for a fixed period, typically ranging from 0 to 5 years as Time-Deposit, crucially without the accrual of any interest.</p>
          <p>The intent behind this interest-free deposit is to empower recipient countries. They are permitted to utilize these deposits for their own banking operations, specifically to provide loans. The objective is to stimulate economic value, thereby contributing to the Gross Domestic Product (GDP) and increasing the per capita income of their citizens.</p>
          <p>This mechanism serves as a powerful incentive for nations to align with the Reserveben Group's philosophy, as it offers a substantial, long-term capital injection without the burden of interest payments, a fundamental departure from conventional international lending models. This allows recipient countries to leverage these funds for internal economic growth by issuing loans through their own banking systems, effectively providing a non-debt-creating stimulus. This strategy aims to demonstrate the viability and benefits of a non-riba system, potentially encouraging its wider adoption and cementing the Reserveben Group's influence by providing a tangible alternative to traditional lending models offered by institutions like the IMF or World Bank.</p>
      `,
  },
  {
      id: 'q20',
      title: 'What is Foreign Direct Investment (FDI) and Domestic Direct Investment (DDI)?',
      content: `
          <p>Foreign Direct Investment (FDI) and Domestic Direct Investment (DDI) are crucial components of the Reserveben Group's economic strategy, aimed at stimulating economic growth and increasing per capita income across nations.</p>
          <p>FDI refers to investments made by foreign entities into a country, while DDI refers to investments made by domestic entities within their own country. Both are intended to have a significant economic impact on the Gross Domestic Product (GDP) and per capita income for international populations.</p>
          <p>Within the Reserveben Group's framework, FDI and DDI are supported by the Foreign Exchange Reserve Balance, which serves as collateral or backing for strengthening local currencies and for the issuance of new currencies, often based on the world recognized currency.</p>
          <p>The Private Investment Program, implemented by the "Iron Corridor Economy" companies, allocates 45% of its returns specifically for Foreign Direct Investment directed towards countries experiencing economic pressure. This investment is provided in the form of collateralized Foreign Exchange Reserve Balance, backed by the World recognized currency or another currency projected to become a future dominant global currency. The Reserveben Group's overall mission includes stabilizing currencies and economies by supporting FDI and DDI to boost GDP and per capita income.</p>
      `,
  }
];

const sections = [
    { id: 'section1', title: 'Section 1: The Principal Founder: Identity and Guiding Principles', questions: ['q1', 'q2', 'q3', 'q4', 'q5'] },
    { id: 'section2', title: 'Section 2: Global Organizational Structure and Key Development Programs', questions: ['q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13'] },
    { id: 'section3', title: 'Section 3: Visionary Principles and Strategic Objectives', questions: ['q14', 'q15'] },
    { id: 'section4', title: 'Section 4: Concepts & Principles', questions: ['q16', 'q17'] },
    { id: 'section5', title: 'Section 5: Financial Mechanisms and Asset Management', questions: ['q18', 'q19', 'q20'] },
];

const sectionStyles = [
    { // Section 1
        bgClass: 'bg-yellow-400',
        textClass: 'text-black',
        qNumClass: 'text-red-600 font-bold',
        hoverClass: 'hover:bg-yellow-300'
    },
    { // Section 2
        bgClass: 'bg-gradient-to-r from-red-600/50 to-slate-800/10',
        textClass: 'text-slate-200',
        qNumClass: 'text-white font-bold',
        hoverClass: 'hover:brightness-125'
    },
    { // Section 3
        bgClass: 'bg-gradient-to-r from-[#53d769]/40 to-slate-800/10',
        textClass: 'text-slate-200',
        qNumClass: 'text-red-400 font-bold',
        hoverClass: 'hover:brightness-125'
    },
    { // Section 4
        bgClass: 'bg-[#fef12e]',
        textClass: 'text-black',
        qNumClass: 'text-red-700 font-bold',
        hoverClass: 'hover:bg-yellow-300'
    },
    { // Section 5
        bgClass: 'bg-gradient-to-r from-[#3731fc]/40 to-slate-800/10',
        textClass: 'text-slate-200',
        qNumClass: 'text-red-400 font-bold',
        hoverClass: 'hover:brightness-125'
    },
];

export const CompendiumModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const contentRef = useRef<HTMLElement>(null);

  // This handler fixes the anchor link navigation inside a scrollable div.
  const handleLinkClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    // Find the closest anchor tag with an href starting with #
    const anchor = target.closest('a[href^="#"]');

    if (anchor) {
      event.preventDefault();
      const href = anchor.getAttribute('href');
      if (href) {
        const id = href.substring(1);
        const targetElement = contentRef.current?.querySelector(`#${id}`);
        if (targetElement) {
          // Scroll the target element into view within the main content area
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compendium-title"
    >
      <div
        className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl w-full max-w-md h-[90vh] flex flex-col border border-slate-600"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
          <h2 id="compendium-title" className="text-xl font-bold text-yellow-300">
            Q&A Compendium
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Close Compendium"
          >
            <X size={24} />
          </button>
        </header>

        <main
          id="compendium-content"
          ref={contentRef}
          onClick={handleLinkClick}
          className="flex-grow p-6 overflow-y-auto custom-scrollbar-tape"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="prose prose-xl prose-invert max-w-none prose-p:text-slate-300 prose-h3:text-yellow-400 prose-h3:mb-2 prose-h3:mt-8 prose-h4:text-lg prose-h4:font-semibold prose-h4:text-sky-300 prose-li:text-slate-300 prose-strong:text-yellow-300 prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline">
            
            <p>This Q&A Compendium is STRICTLY composed as a comprehensive knowledge assessment tool for members of DZA Group only. Its purpose is to ensure a thorough understanding of the organization's foundational identity, visionary principles, strategic action plans, intricate organizational structure, and innovative financial mechanisms. Mastery of this information is crucial for aligning individual efforts with the Group's ambitious global economic transformation and humanitarian objectives.</p>

            <h3 id="toc">Table of Contents</h3>
            
            {sections.map((section, sectionIndex) => (
                 <div key={section.id}>
                    <a href={`#${section.id}`}><h4 className="text-teal-300">{section.title}</h4></a>
                    <ul className="list-none p-0 m-0 space-y-2">
                        {section.questions.map(qId => {
                            const question = qnaData.find(q => q.id === qId);
                            if (!question) return null;
                            const qNum = parseInt(qId.substring(1));
                            
                            const style = sectionStyles[sectionIndex];

                            return (
                                <li key={qId} className={`border border-slate-600 rounded-lg p-3 transition-all duration-200 ${style.bgClass} ${style.hoverClass}`}>
                                    <a href={`#${qId}`} className={style.textClass}>
                                        <strong className={style.qNumClass}>Q{qNum}:</strong> {question.title}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                 </div>
            ))}
            

            <hr className="my-8 border-slate-600" />
            
            {sections.map(section => (
                <div key={section.id}>
                    <h3 id={section.id}>{section.title}</h3>
                    {section.questions.map(qId => {
                        const question = qnaData.find(q => q.id === qId);
                        if (!question) return null;
                        const qNum = parseInt(qId.substring(1));
                        const bgColor = 'bg-slate-900/50';
                        return (
                             <div key={qId} id={qId} className={`border border-slate-600 rounded-lg p-4 my-6 ${bgColor}`}>
                                <h4><strong className="text-red-400">Q{qNum}:</strong> <span className="text-yellow-300">{question.title}</span></h4>
                                <div dangerouslySetInnerHTML={{ __html: question.content }} />
                                <a href="#toc" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300 font-semibold">Back to Table of Contents</a>
                            </div>
                        );
                    })}
                </div>
            ))}

            <p className="text-sm text-slate-400 italic text-center mt-8 pt-4 border-t border-slate-700">Information updated as of July 29, 2024.</p>
          </div>
        </main>
      </div>
    </div>
  );
};
