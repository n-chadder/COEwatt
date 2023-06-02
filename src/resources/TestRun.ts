import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import * as pug from "pug";

const prisma = new PrismaClient()
const router = express.Router()

const appURL = 'http://localhost:3000/'; 

const compiledTestRunsPage = pug.compileFile("src/static/test_runs.pug");
const compiledTestRunDetailsPage = pug.compileFile("src/static/test_run_details.pug");

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
});

router.get('/', async (req: Request, res: Response) => {
  let testRuns = await prisma.testRun.findMany({
    include: {
      App: true
    },
    orderBy: {
      Created: "desc",
    }
  });
  
  res.format({
    'application/json': function(){
      res.status(200).json(testRuns);
      return;
    },
    'text/html': function(){
      let page = compiledTestRunsPage({testRuns});
      res.status(200).send(page);
      return;
    }
  });
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const testRun = await prisma.testRun.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        App: true,
        Reports: {
          include: {
            Page: true
          }
        }
      }
    });
    res.format({
      'application/json': function(){
        res.status(200).json(testRun);
        return;
      },
      'text/html': function(){
        let page = compiledTestRunDetailsPage({testRun});
        res.status(200).send(page);
        return;
      }
    });
  }
  catch (err: any) {
    console.log(err);
    res.status(404).send('<h1>Sorry the Test Run you requested cannot be found</h1>'); 
  }
});

router.post('/', async (req: Request, res: Response) => {
  try{
    let data = await buildTesterPostData(req);
    let testResult = await fetch('http://0.0.0.0:8080/', { // temp url for tester
      method: "POST", 
      mode: "cors",
      cache: "no-store", 
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "manual",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    let result = await testResult.json();
    let TestRunID = await saveTestRun(req, result);
    
    res.status(200).send({"TestRunID": TestRunID});
  }
  catch(e: any){    
    console.log(e);
    res.status(500).send({"error": "error"});
  }
  
});

async function buildTesterPostData(req: Request) {
  try{
    const AppID: string = req.body.AppID;
    const pageURL: string = req.body.pageURL;
    const WCAGVersion: string = req.body.WCAGVersion;
    const Action: string = req.body.Action;
    const NeedAuth: boolean = req.body.NeedAuth;
    
    // if the page NeedAuth, then we need to build the json obj 'authenticationData' that is used by the tester code.
    let authenticationData = {
      "uName": "",
      "uNameElement": "",
      "uPword": "",
      "uPwordElement": "",
      "submitNameID": "",
      "loginUrl": "",
      "additionalActions": "" 
    };                          
    
    if (NeedAuth) {
      // let data = await fetch(`${appURL}applications/${AppID}`,);
      // let AppData = await data.json();
      authenticationData.loginUrl = req.body.authenticationData.loginUrl;
      authenticationData.uName = req.body.authenticationData.uName;
      authenticationData.uNameElement = req.body.authenticationData.uNameElement;
      authenticationData.uPword = req.body.authenticationData.uPword;
      authenticationData.uPwordElement = req.body.authenticationData.uPwordElement;
      authenticationData.submitNameID = req.body.authenticationData.submitNameID;
      authenticationData.additionalActions = req.body.authenticationData.additionalActions;
    }  
    
    let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.34"; // prefilled in IMSIS test app form
    let postData = {
      "url": pageURL,
      "WCAG_version": WCAGVersion,
      "runner_name": "pally", // hard coded for now, at least in IMSIS there is pally, pally-axe, and axe
      "authenticationData": authenticationData,
      "userAgentString": userAgent,
      "action": Action,
    };
    return postData;
  }
  catch(err: any){
    throw err;
    
  }
}

async function saveTestRun(req: Request, testResult: any) {
  try{
    const AppID: number = Number(req.body.AppID);
    const PageID: number = Number(req.body.PageID);
    // if TestRunID == -1 - this is to be saved as a new TestRun instance; else its a part of specific TestRun instance
    // i.e. when a user clicks Test on an app where all of the app's pages will be tested - in this case all the pages tested 
    // should have the same TestRunID that way they can be identified as part of a single test run.
    const TestRunID: number = req.body.TestRunID == null ? -1: Number(req.body.TestRunID);
    let pageComplianceID = testResult.issues.length == 0 ? 1: 2;
    let updatedPage = await prisma.page.update({
      where: { id: PageID},
      data: {
        ComplianceID: pageComplianceID
      }
    });
    if (TestRunID == -1) {
      // build new TestRun obj and save info to it
      let TestRun = await prisma.testRun.create({
        data: {
          Created: new Date(),
          App: {
            connect : {id: AppID},
          }
        }
      });
  
      let Report = await prisma.report.create({
        data: {
          Page: {
            connect: {id: PageID},
          },
          TestRun: {
            connect: {id: TestRun.id},
          },
          data: JSON.stringify(testResult)
        }
      });

      return TestRun.id;
    }
    else {
      let Report = await prisma.report.create({
        data: {
          Page: {
            connect: {id: PageID},
          },
          TestRun: {
            connect: {id: TestRunID},
          },
          data: JSON.stringify(testResult)
        }
      });
      return TestRunID;
    }
  }
  catch (err: any) {
    throw err;
  }
  
}

export { router as testrun }