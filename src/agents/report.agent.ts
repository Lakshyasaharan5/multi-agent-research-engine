export async function runReportAgent(findings: any[]) {
  return {
    report: findings.map((finding) => ({
      title: finding.title,
      url: finding.url,
      summary: finding.summary,
    })),
  };
}
