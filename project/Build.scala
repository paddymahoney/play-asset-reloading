import sbt._
import sbt.Keys._

object Build extends sbt.Build {

  import com.typesafe.sbt.web.Import.Assets
  import com.typesafe.sbt.gzip.Import.gzip
  import com.typesafe.sbt.web.Import.pipelineStages
  import play.Play.autoImport.PlayKeys

  private val assetPipeline = Seq(
    pipelineStages := Seq(gzip))

  lazy val admin = project.in(file("admin")).settings(
    ivyConfigurations += Assets,
    // Export the product
    exportedProducts in Assets := {
      val jarFile = PlayKeys.playPackageAssets.value
      val art = (artifact in PlayKeys.playPackageAssets).value
      val module = projectID.value
      Seq(Attributed.blank(jarFile).put(artifact.key, art).put(moduleID.key, module).put(configuration.key, Assets))
    },
    // Optional, if you want to publish the assets artifact
    packagedArtifacts += ((artifact in PlayKeys.playPackageAssets).value -> PlayKeys.playPackageAssets.value)
  ).enablePlugins(play.PlayScala)
  lazy val auvik = project.in(file("auvik")).settings().dependsOn(admin % "compile->compile;test->test;compile->web-assets").enablePlugins()

}