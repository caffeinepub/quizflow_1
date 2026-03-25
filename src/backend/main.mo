import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type QuizId = Nat;
  type Timestamp = Int;

  type QuizStatus = {
    #draft;
    #published;
  };

  type Question = {
    prompt : Text;
    options : [Text];
    correctIndex : Nat;
  };

  type QuestionOutput = {
    prompt : Text;
    options : [Text];
  };

  type Quiz = {
    id : QuizId;
    title : Text;
    description : Text;
    status : QuizStatus;
    questions : [Question];
  };

  type Submission = {
    participantName : Text;
    quizId : QuizId;
    answers : [Nat];
    score : Nat;
    timestamp : Timestamp;
    correctAnswers : [Nat];
  };

  module Submission {
    public func compare(s1 : Submission, s2 : Submission) : Order.Order {
      if (s1.timestamp < s2.timestamp) { #less } else if (s1.timestamp > s2.timestamp) { #greater } else { #equal };
    };
  };

  let quizzes = Map.empty<QuizId, Quiz>();
  let submissions = Map.empty<QuizId, List.List<Submission>>();
  var nextQuizId = 0;

  // Auth system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func getQuizInternal(quizId : QuizId) : Quiz {
    switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz not found") };
      case (?quiz) { quiz };
    };
  };

  public shared ({ caller }) func createQuiz(title : Text, description : Text) : async QuizId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create quizzes");
    };
    let quizId = nextQuizId;
    nextQuizId += 1;

    let newQuiz : Quiz = {
      id = quizId;
      title;
      description;
      status = #draft;
      questions = [];
    };

    quizzes.add(quizId, newQuiz);
    quizId;
  };

  public shared ({ caller }) func addQuestion(quizId : QuizId, question : Question) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };
    if (question.options.size() < 2 or question.options.size() > 4) {
      Runtime.trap("Invalid number of options");
    };
    if (question.correctIndex >= question.options.size()) {
      Runtime.trap("Correct answer index out of bounds");
    };

    switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz not found") };
      case (?quiz) {
        let updatedQuestions = quiz.questions.concat([question]);
        let updatedQuiz = { quiz with questions = updatedQuestions };
        quizzes.add(quizId, updatedQuiz);
      };
    };
  };

  public shared ({ caller }) func publishQuiz(quizId : QuizId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can publish quizzes");
    };
    let quiz = getQuizInternal(quizId);
    quizzes.add(quizId, { quiz with status = #published });
  };

  public shared ({ caller }) func unpublishQuiz(quizId : QuizId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can unpublish quizzes");
    };
    let quiz = getQuizInternal(quizId);
    quizzes.add(quizId, { quiz with status = #draft });
  };

  public shared ({ caller }) func deleteQuiz(quizId : QuizId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete quizzes");
    };
    if (not quizzes.containsKey(quizId)) {
      Runtime.trap("Quiz not found");
    };
    quizzes.remove(quizId);
    submissions.remove(quizId);
  };

  public query ({ caller }) func getPublishedQuizzes() : async [QuizId] {
    quizzes.filter(func(_, quiz) { quiz.status == #published }).keys().toArray();
  };

  public query ({ caller }) func getQuizForTaking(quizId : QuizId) : async [QuestionOutput] {
    let quiz = getQuizInternal(quizId);
    
    // Non-admins can only view published quizzes
    if (not (AccessControl.isAdmin(accessControlState, caller)) and quiz.status != #published) {
      Runtime.trap("Unauthorized: Quiz is not published");
    };
    
    quiz.questions.map(
      func(q) {
        {
          prompt = q.prompt;
          options = q.options;
        };
      }
    );
  };

  public shared ({ caller }) func submitAnswers(participantName : Text, quizId : QuizId, answers : [Nat]) : async Submission {
    let quiz = getQuizInternal(quizId);
    
    // Anyone can submit, but only to published quizzes
    if (quiz.status != #published) {
      Runtime.trap("Cannot submit answers to unpublished quiz");
    };
    
    if (quiz.questions.size() == 0) {
      Runtime.trap("Quiz has no questions");
    };

    let correctAnswers = quiz.questions.map(func(q) { q.correctIndex });
    if (answers.size() != correctAnswers.size()) {
      Runtime.trap("Answer count does not match question count");
    };

    var score = 0;
    for (i in Nat.range(0, answers.size() - 1)) {
      if (answers[i] == correctAnswers[i]) {
        score += 1;
      };
    };

    let submission : Submission = {
      participantName;
      quizId;
      answers;
      score;
      timestamp = Time.now();
      correctAnswers;
    };

    let existingSubmissions = switch (submissions.get(quizId)) {
      case (null) { List.empty<Submission>() };
      case (?list) { list };
    };
    existingSubmissions.add(submission);
    submissions.add(quizId, existingSubmissions);

    submission;
  };

  public query ({ caller }) func getQuizSubmissions(quizId : QuizId) : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view submissions");
    };
    switch (submissions.get(quizId)) {
      case (null) { [] };
      case (?submissionList) { submissionList.toArray().sort() };
    };
  };

  public query ({ caller }) func getQuiz(quizId : QuizId) : async Quiz {
    let quiz = getQuizInternal(quizId);
    
    // Non-admins can only view published quizzes
    if (not (AccessControl.isAdmin(accessControlState, caller)) and quiz.status != #published) {
      Runtime.trap("Unauthorized: Quiz is not published");
    };
    
    quiz;
  };

  public query ({ caller }) func getAllQuizzes() : async [Quiz] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all quizzes");
    };
    quizzes.values().toArray();
  };
};
