// Copyright 2004-present Facebook. All Rights Reserved.

package com.facebook.react.module.processing;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.Filer;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.Modifier;
import javax.lang.model.element.TypeElement;
import javax.lang.model.type.MirroredTypesException;
import javax.lang.model.type.TypeMirror;
import javax.lang.model.util.Elements;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.facebook.infer.annotation.SuppressFieldNotInitialized;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.module.annotations.ReactModuleList;
import com.facebook.react.module.model.ReactModuleInfo;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;

import static javax.lang.model.element.Modifier.PUBLIC;

/**
 * Generates a list of ReactModuleInfo for modules annotated with {@link ReactModule} in
 * {@link ReactPackage}s annotated with {@link ReactModuleList}.
 */
@SupportedAnnotationTypes({
  "com.facebook.react.module.annotations.ReactModule",
  "com.facebook.react.module.annotations.ReactModuleList",
})
@SupportedSourceVersion(SourceVersion.RELEASE_7)
public class ReactModuleSpecProcessor extends AbstractProcessor {

  private static final TypeName MAP_TYPE = ParameterizedTypeName.get(
    Map.class,
    Class.class,
    ReactModuleInfo.class);
  private static final TypeName INSTANTIATED_MAP_TYPE = ParameterizedTypeName.get(HashMap.class);

  @SuppressFieldNotInitialized
  private Filer mFiler;
  @SuppressFieldNotInitialized
  private Elements mElements;

  @Override
  public synchronized void init(ProcessingEnvironment processingEnv) {
    super.init(processingEnv);

    mFiler = processingEnv.getFiler();
    mElements = processingEnv.getElementUtils();
  }

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    Set<? extends Element> reactModuleListElements = roundEnv.getElementsAnnotatedWith(
      ReactModuleList.class);
    for (Element reactModuleListElement : reactModuleListElements) {
      TypeElement typeElement = (TypeElement) reactModuleListElement;
      ClassName className = ClassName.get(typeElement);
      String packageName = ClassName.get(typeElement).packageName();
      String fileName = className.simpleName();

      ReactModuleList reactModuleList = typeElement.getAnnotation(ReactModuleList.class);
      List<String> nativeModules = new ArrayList<>();
      try {
        reactModuleList.value(); // throws MirroredTypesException
      } catch (MirroredTypesException mirroredTypesException) {
        List<? extends TypeMirror> typeMirrors = mirroredTypesException.getTypeMirrors();
        for (TypeMirror typeMirror : typeMirrors) {
          nativeModules.add(typeMirror.toString());
        }
      }

      MethodSpec getReactModuleInfosMethod = MethodSpec.methodBuilder("getReactModuleInfos")
        .addModifiers(PUBLIC)
        // TODO add function to native module interface
//        .addAnnotation(Override.class)
        .addCode(getCodeBlockForReactModuleInfos(nativeModules))
        .returns(MAP_TYPE)
        .build();

      TypeSpec reactModulesInfosTypeSpec = TypeSpec.classBuilder(
        fileName + "$$ReactModuleInfoProvider")
        .addModifiers(Modifier.PUBLIC)
        .addMethod(getReactModuleInfosMethod)
        .build();

      JavaFile javaFile = JavaFile.builder(packageName, reactModulesInfosTypeSpec)
        .addFileComment("Generated by " + getClass().getName())
        .build();

      try {
        javaFile.writeTo(mFiler);
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return true;
  }

  private CodeBlock getCodeBlockForReactModuleInfos(List<String> nativeModules) {
    CodeBlock.Builder builder = CodeBlock.builder()
      .addStatement("$T map = new $T()", MAP_TYPE, INSTANTIATED_MAP_TYPE);

    for (String nativeModule : nativeModules) {
      String keyString = nativeModule + ".class";

      TypeElement typeElement = mElements.getTypeElement(nativeModule);
      ReactModule reactModule = typeElement.getAnnotation(ReactModule.class);
      String valueString = new StringBuilder()
        .append("new ReactModuleInfo(")
        .append("\"").append(reactModule.name()).append("\"").append(", ")
        .append(reactModule.canOverrideExistingModule()).append(", ")
        .append(reactModule.supportsWebWorkers()).append(", ")
        .append(reactModule.needsEagerInit())
        .append(")")
        .toString();

      builder.addStatement("map.put(" + keyString + ", " + valueString + ")");
    }
    builder.addStatement("return map");
    return builder.build();
  }
}
