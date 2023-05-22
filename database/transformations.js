// Function to transform personal reports into feedbacks for each card
const personReportsToFeedbacks = (cards) => {
  const result = cards.map((card) => {
    // Filter out personal reports that do not have any feedbacks
    card.personalReports = card.personalReports.filter(
      (report) => report.feedbacks.length
    );
    // Transform each personal report into a feedback
    card.personalFeedbacks = card.personalReports.map((report) => {
      if (report.feedbacks.length) {
        const feedback = { ...report.feedbacks[0] };
        feedback.createdBy = report.user;
        feedback.date = report.date;
        feedback.report = report._id;
        return feedback;
      }
    });
    // Remove the personalReports field from the card
    delete card.personalReports;
    return card;
  });
  return result;
};

module.exports = {
  personReportsToFeedbacks,
};
