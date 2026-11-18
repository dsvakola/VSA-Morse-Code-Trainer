/**
 * Ham Community — hand-picked clubs, classes, practice sites and forums where learners can meet
 * other operators. Links open in the user's own browser; the app itself stays offline.
 */

import { errorText, openExternal } from "../api";
import { h, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";

export interface CommunityLink {
  name: string;
  url: string;
  text: string;
}

export const COMMUNITY: Array<{ title: string; intro: string; links: CommunityLink[] }> = [
  {
    title: "Learn with a class",
    intro: "Live online classes with volunteer mentors. Nothing beats practising with real people.",
    links: [
      {
        name: "CW Academy (CWops)",
        url: "https://cwops.org/cw-academy/",
        text: "Free online classes from beginner to advanced, taught over video by experienced operators.",
      },
      {
        name: "Long Island CW Club",
        url: "https://longislandcwclub.org/",
        text: "A very active club with many weekly online classes for every level, open to members worldwide.",
      },
      {
        name: "ARRL: Learning Morse Code",
        url: "https://www.arrl.org/Learning-Morse-Code",
        text: "Guidance and the W1AW code-practice archive at speeds from 5 to 40 words per minute.",
      },
    ],
  },
  {
    title: "Practise on your own",
    intro: "Free practice sites to use alongside this trainer.",
    links: [
      {
        name: "LCWO, Learn CW Online",
        url: "https://lcwo.net/",
        text: "A long-running free Koch-method course with speed and callsign practice.",
      },
      {
        name: "Morse Code Ninja",
        url: "https://morsecode.ninja/",
        text: "Thousands of practice recordings of words, phrases and contacts at many speeds.",
      },
      {
        name: "Morse Code World",
        url: "https://morsecode.world/",
        text: "Instant character recognition, word list and news-headline trainers in the browser.",
      },
    ],
  },
  {
    title: "Get on the air",
    intro: "Clubs and activities where you can make your first real Morse contacts.",
    links: [
      {
        name: "SKCC, Straight Key Century Club",
        url: "https://www.skccgroup.com/",
        text: "For lovers of the straight key: free membership, weekly sprints and friendly awards.",
      },
      {
        name: "CWops",
        url: "https://cwops.org/",
        text: "The club behind CW Academy, with regular CW activity sessions on the air.",
      },
    ],
  },
  {
    title: "Licences and national societies",
    intro: "To transmit you need an amateur licence. Your national society shows the way.",
    links: [
      {
        name: "IARU member societies",
        url: "https://www.iaru.org/about-us/organisation-and-history/member-societies/",
        text: "Find the amateur radio society of your own country.",
      },
      {
        name: "ARRL (United States)",
        url: "https://www.arrl.org/",
        text: "The national association for amateur radio in the USA.",
      },
      {
        name: "RSGB (United Kingdom)",
        url: "https://rsgb.org/",
        text: "The Radio Society of Great Britain.",
      },
    ],
  },
  {
    title: "Forums",
    intro: "Ask questions and share your progress with operators around the world.",
    links: [
      {
        name: "QRZ.com forums",
        url: "https://forums.qrz.com/",
        text: "One of the largest amateur radio forums, with a busy CW section.",
      },
      {
        name: "eHam.net",
        url: "https://www.eham.net/",
        text: "Long-standing forums, articles and equipment reviews.",
      },
      {
        name: "r/amateurradio",
        url: "https://www.reddit.com/r/amateurradio/",
        text: "Reddit's large and welcoming amateur radio community.",
      },
      {
        name: "r/morsecode",
        url: "https://www.reddit.com/r/morsecode/",
        text: "Reddit's community for Morse code learners and enthusiasts.",
      },
    ],
  },
];

export default function communityPage(): Page {
  const open = (url: string) => openExternal(url).catch((e) => toast(errorText(e), "error"));
  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Ham Community"),
      h(
        "p",
        { class: "lead" },
        "Morse code lives on the air. When you are ready, join the operators who keep it alive: classes, clubs, practice sites and forums from around the world. Each link opens in your web browser.",
      ),
    ),
    COMMUNITY.map((group) =>
      h(
        "section",
        { class: "stack" },
        h("h3", null, group.title),
        h("p", { class: "small muted" }, group.intro),
        h(
          "div",
          { class: "grid three" },
          group.links.map((l) =>
            h(
              "button",
              { class: "card room-card", onclick: () => open(l.url), title: l.url },
              h("div", { class: "row" }, icon("globe", "icon sm"), h("b", null, l.name)),
              h("p", { class: "small" }, l.text),
              h(
                "p",
                { class: "small muted mono" },
                l.url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""),
              ),
            ),
          ),
        ),
      ),
    ),
    h(
      "div",
      { class: "feedback ok stack" },
      h(
        "p",
        null,
        "73! Good luck on the air. The trainer is free and open source: share it with anyone learning the code.",
      ),
      h(
        "p",
        null,
        "Your suggestions and feedback are always welcome to help improve this software. Write to ",
        h(
          "a",
          {
            href: "mailto:softinquiry@vsa.edu.in",
            onclick: (e: Event) => {
              e.preventDefault();
              void open("mailto:softinquiry@vsa.edu.in");
            },
          },
          "softinquiry@vsa.edu.in",
        ),
        ".",
      ),
    ),
  );
  return { el };
}
