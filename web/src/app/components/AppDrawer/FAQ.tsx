export const FAQ = () => {
  return (
    <div>
      <p>Table of Contents</p>
      <ul>
        <li>
          <a>General</a>
        </li>
        <ul>
          <li>
            <a>What is the history of SlackMap?</a>
          </li>
          <li>
            <a>What are the differences between a line, spot and access guide?</a>
          </li>
          <li>
            <a>How can I sign up?</a>
          </li>
        </ul>
        <li>
          <a>Adding, Updating and Deleting</a>
          <ul>
            <li>
              <a>How can I add a line, spot or access guide?</a>
            </li>
            <li>
              <a>How can I update a line, spot or access guide?</a>
            </li>
            <li>
              <a>How can I delete a line, spot or access guide?</a>
            </li>
          </ul>
        </li>
        <li>
          <a>Help &amp; Support</a>
          <ul>
            <li>
              <a>How can I help to volunteer?</a>
            </li>
            <li>
              <a>How can I help as a developer/designer?</a>
            </li>
          </ul>
        </li>
      </ul>
      <h2>General</h2>
      <h3>What is the history of SlackMap?</h3>
      <p>
        Slackmap was originally started by Piotr Błaszczak from Poland. In the past couple years the
        maintenance work got too overwhelming and he was looking for alternatives.
      </p>
      <p>
        The ISA skipped in and Can Sahin from Turkey took on the task to recreate slackmap from
        scratch, working with a small group of people to define the requirements of a new Slackmap.
      </p>
      <p>
        Can Sahin created the new webapp with about a tenth of the code compared to the old
        slackmap, following the principle of simplicity, building it with generic features. This
        minimizes maintenance and also lowers the entry bar for new programmers who want help keep
        slackmap alive in the future. This further means that new features will only be integrated
        if they can also follow these principles. Furthermore the slackline groups data, originally
        created by Kimberly Weglin, Ryan Jenks and Grant Mercier was imported into a worldwide
        community map.
      </p>
      <p>
        At a strategic level the ISA Nature and Access Commission, a ISA suborganization, is in
        charge of Slackmap, deciding on the implementation and changes of new features, mentoring
        with local communities and interest groups and deciding in case of access conflicts.
      </p>
      <h3>What are the differences between a line, spot and access guide?</h3>
      <ul>
        <li>
          <strong>Lines:</strong> Individual slacklines marked with red color,
        </li>
        <li>
          <strong>Spots:</strong> Areas with multiple lines, marked with green color,
        </li>
        <li>
          <strong>Access Guides:</strong> Points, lines or areas that inform about access(parking,
          paths, restricted areas etc.) marked with an orange color.
        </li>
      </ul>
      <h3>How can I sign up?</h3>
      <p>
        You can sign up with your Slackline International Account. If you don&#39;t have an account,
        you can create one from{' '}
        <a target="_blank" rel="noreferrer">
          here
        </a>
        .
      </p>
      <h3>How is SlackMap funded and developed?</h3>
      <p>
        SlackMap is funded by Slackline International and developed by volunteers from the slackline
        community. We need your help to keep SlackMap up to date and to add new features. All the
        work is done on a voluntary basis.
      </p>
      <h2>Adding, Updating and Deleting</h2>
      <h3>How can I add a line, spot or access guide?</h3>
      <p>
        Click to the &quot;Add&quot; button from the right-bottom corner of the map. Then select the
        type of the feature you want to add. You need to be logged in to add a feature.
      </p>
      <h3>How can I update a line, spot or access guide?</h3>
      <p>
        Go to the details page of the feature and click to &quot;Request To Edit&quot; button from
        the corner menu.
      </p>
      <h3>How can I delete a line, spot or access guide?</h3>
      <p>
        Go to the details page of the feature and click to &quot;Delete&quot; button from the corner
        menu. If you are not the owner of the feature, the request will be reviewed by the admin.
      </p>
      <h2>Help &amp; Support</h2>
      <h3>How can I help to volunteer?</h3>
      <p>
        Sign up as a volunteer{' '}
        <a target="_blank" rel="noreferrer">
          here
        </a>
        , thanks!
      </p>
      <h3>How can I help as a developer/designer?</h3>
      <p>Contact us via email or Github.</p>
    </div>
  );
};
