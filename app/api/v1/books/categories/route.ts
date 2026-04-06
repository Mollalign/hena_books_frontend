import { jsonResponse } from "@/lib/api-utils";

const CATEGORIES = [
  { value: "BIBLICAL_STUDIES", label: "Biblical Studies" },
  { value: "THEOLOGY", label: "Theology" },
  { value: "DEVOTIONAL", label: "Devotional" },
  { value: "CHRISTIAN_LIVING", label: "Christian Living" },
  { value: "PRAYER_WORSHIP", label: "Prayer & Worship" },
  { value: "CHURCH_HISTORY", label: "Church History" },
  { value: "APOLOGETICS", label: "Apologetics" },
  { value: "FAMILY_MARRIAGE", label: "Family & Marriage" },
  { value: "YOUTH_CHILDREN", label: "Youth & Children" },
  { value: "MISSIONS_EVANGELISM", label: "Missions & Evangelism" },
  { value: "SPIRITUAL_GROWTH", label: "Spiritual Growth" },
  { value: "BIOGRAPHY_TESTIMONY", label: "Biography & Testimony" },
  { value: "COMMENTARY", label: "Commentary" },
  { value: "REFERENCE", label: "Reference" },
  { value: "OTHER", label: "Other" },
];

export async function GET() {
  return jsonResponse({ categories: CATEGORIES });
}
